import argparse
import lz4.frame
import os
import sys

def decompress_file(input_path, output_path=None):
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found.")
        sys.exit(1)

    if output_path is None:
        if input_path.endswith('.lz4'):
            output_path = input_path[:-4]
        else:
            output_path = input_path + '.decompressed'

    try:
        with open(input_path, 'rb') as f_in:
            compressed_data = f_in.read()
            decompressed_data = lz4.frame.decompress(compressed_data)
        
        with open(output_path, 'wb') as f_out:
            f_out.write(decompressed_data)
            
        print(f"Successfully decompressed '{input_path}' to '{output_path}'")
        
    except Exception as e:
        print(f"Error during decompression: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Decompress an LZ4 file.")
    parser.add_argument("input_file", help="Path to the LZ4 compressed file")
    parser.add_argument("-o", "--output", help="Path to the output file (optional)")
    
    args = parser.parse_args()
    
    decompress_file(args.input_file, args.output)

if __name__ == "__main__":
    main()
