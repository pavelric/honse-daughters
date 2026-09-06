from mitmproxy import http, dns
import logging
import ipaddress

API_HOST = "localhost"
# 198.51.100.0/24 subnet reserved for documentation, so it will never be used for anything else
#We can black-hole this address because it will be discarded.
API_DNS_REDIRECT_HOST = ipaddress.IPv4Address("198.51.100.140")
DNS_TTL= 600
API_PORT = 8000
API_SCHEME = 'http'
MAGIC_DOMAIN_SUFFIX = ".mitm.it"


prefixes = ["", "/assets"] #, "/webview"]

# hostname: prefix_index
hosts = {

    # global server
    "api.games.umamusume.com": 0,

    # assets
    "assets-umamusume-en.akamaized.net": 1,

    #webview
    #"webview.games.umamusume.com": 2,
}

def dns_request(flow: dns.DNSFlow):
    if not flow.request.query or flow.request.questions is None: return
    logging.info(f"[INFO] DNS request for {flow.request.questions}")
    for question in flow.request.questions:
        name = question.name
        prefix_type = hosts.get(name) if question.type == 1 else None
        if prefix_type != None: #Type is 1 when asking for an A record
            #logging.info(f"[INFO] Matched DNS request for {question.name}")
            if flow.response is None:
                logging.info("[INFO] DNS flow has no response; skipping answer modifications")
                continue
            flow.response.answers = [answer for answer in flow.response.answers if answer.name != question.name]
            domain_redirect = f'{question.name}{MAGIC_DOMAIN_SUFFIX}'
            #TODO: Are the CNAME records still useful in this configuration? Might be better to remove them and the host_redirects altogether....
            cname_rec = dns.ResourceRecord.CNAME(question.name, domain_redirect, ttl=DNS_TTL)
            a_rec = dns.ResourceRecord.A(domain_redirect, API_DNS_REDIRECT_HOST, ttl=DNS_TTL)
            flow.response.answers.append(cname_rec)
            flow.response.answers.append(a_rec)
    if flow.response is not None:
        logging.info(f"[INFO] Answered with {flow.response.answers}")
    else:
        logging.info("[INFO] No DNS response available to log")


def request(flow: http.HTTPFlow) -> None:
    logging.info(f"[DEBUG] Request for host: {flow.request.pretty_host}, path: {flow.request.path}")
    prefix_type = hosts.get(flow.request.pretty_host)
    if prefix_type != None:
        logging.info(f"[INFO] Redirecting {flow.request.pretty_host} to {API_HOST}:{API_PORT}")
        flow.request.host = API_HOST
        flow.request.port = API_PORT
        flow.request.scheme = API_SCHEME

        prefix = prefixes[prefix_type]
        if prefix != "":
            flow.request.path = f"{prefix}{flow.request.path}"
    else:
        logging.info(f"[DEBUG] No redirect found for {flow.request.pretty_host}")
