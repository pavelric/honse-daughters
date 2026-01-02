using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace RaceScenarioViewer
{
    public static class RaceUtils
    {
        public static byte[] DecodeGzipBase64(string content)
        {
            var s = content.Trim('"');
            var raw = Convert.FromBase64String(s);
            using var input = new MemoryStream(raw);
            using var gz = new GZipStream(input, CompressionMode.Decompress);
            using var output = new MemoryStream();
            gz.CopyTo(output);
            return output.ToArray();
        }

        public static RaceSimulateData DeserializeRaceScenario(byte[] b)
        {
            using var ms = new MemoryStream(b);
            using var reader = new BinaryReader(ms);
            var data = new RaceSimulateData();
            var header = new RaceSimulateHeaderData();
            header.max_length = reader.ReadInt32();
            header.version = reader.ReadInt32();
            reader.BaseStream.Position = 4 + header.max_length;
            data.header = header;
            data.distance_diff_max = reader.ReadSingle();
            data.horse_num = reader.ReadInt32();
            data.horse_frame_size = reader.ReadInt32();
            data.horse_result_size = reader.ReadInt32();
            data.__padding_size_1 = reader.ReadInt32();
            reader.BaseStream.Seek(data.__padding_size_1, SeekOrigin.Current);
            data.frame_count = reader.ReadInt32();
            data.frame_size = reader.ReadInt32();
            for (var i = 0; i < data.frame_count; i++)
            {
                var frameStart = reader.BaseStream.Position;
                var frame = new RaceSimulateFrameData();
                frame.time = reader.ReadSingle();
                for (var h = 0; h < data.horse_num; h++)
                {
                    var horseStart = reader.BaseStream.Position;
                    var hf = new RaceSimulateHorseFrameData();
                    hf.distance = reader.ReadSingle();
                    hf.lane_position = reader.ReadUInt16();
                    hf.speed = reader.ReadUInt16();
                    hf.hp = reader.ReadUInt16();
                    hf.temptation_mode = reader.ReadSByte();
                    hf.block_front_horse_index = reader.ReadSByte();
                    var consumed = (int)(reader.BaseStream.Position - horseStart);
                    var skip = data.horse_frame_size - consumed;
                    if (skip > 0) reader.BaseStream.Seek(skip, SeekOrigin.Current);
                    frame.horse_frame.Add(hf);
                }
                reader.BaseStream.Position = frameStart + data.frame_size;
                data.frame.Add(frame);
            }
            data.__padding_size_2 = reader.ReadInt32();
            reader.BaseStream.Seek(data.__padding_size_2, SeekOrigin.Current);
            for (var i = 0; i < data.horse_num; i++)
            {
                var resStart = reader.BaseStream.Position;
                var hr = new RaceSimulateHorseResultData();
                hr.finish_order = reader.ReadInt32();
                hr.finish_time = reader.ReadSingle();
                hr.finish_diff_time = reader.ReadSingle();
                hr.start_delay_time = reader.ReadSingle();
                hr.guts_order = reader.ReadByte();
                hr.wiz_order = reader.ReadByte();
                hr.last_spurt_start_distance = reader.ReadSingle();
                hr.running_style = reader.ReadByte();
                hr.defeat = reader.ReadInt32();
                hr.finish_time_raw = reader.ReadSingle();
                reader.BaseStream.Position = resStart + data.horse_result_size;
                data.horse_result.Add(hr);
            }
            data.__padding_size_3 = reader.ReadInt32();
            reader.BaseStream.Seek(data.__padding_size_3, SeekOrigin.Current);
            data.event_count = reader.ReadInt32();
            for (var i = 0; i < data.event_count; i++)
            {
                var wrapper = new RaceSimulateEventDataWrapper();
                wrapper.event_size = reader.ReadInt16();
                var eventStart = reader.BaseStream.Position;
                var ev = new RaceSimulateEventData();
                ev.frame_time = reader.ReadSingle();
                ev.type = reader.ReadSByte();
                ev.param_count = reader.ReadSByte();
                for (var j = 0; j < ev.param_count; j++)
                {
                    ev.param.Add(reader.ReadInt32());
                }
                wrapper.@event = ev;
                reader.BaseStream.Position = eventStart + wrapper.event_size;
                data.@event.Add(wrapper);
            }
            return data;
        }

        public static RaceSimulateData DeserializeRaceScenarioFromBase64(string content)
        {
            var b = DecodeGzipBase64(content);
            return DeserializeRaceScenario(b);
        }

        public static string DeserializeRaceScenarioBase64ToJson(string content)
        {
            var data = DeserializeRaceScenarioFromBase64(content);
            return JsonConvert.SerializeObject(data, Formatting.Indented);
        }
    }

    public class RaceSimulateHeaderData
    {
        [JsonProperty("max_length")]
        public int max_length { get; set; }
        [JsonProperty("version")]
        public int version { get; set; }
    }

    public class RaceSimulateHorseFrameData
    {
        [JsonProperty("distance")]
        public float distance { get; set; }
        [JsonProperty("lane_position")]
        public ushort lane_position { get; set; }
        [JsonProperty("speed")]
        public ushort speed { get; set; }
        [JsonProperty("hp")]
        public ushort hp { get; set; }
        [JsonProperty("temptation_mode")]
        public sbyte temptation_mode { get; set; }
        [JsonProperty("block_front_horse_index")]
        public sbyte block_front_horse_index { get; set; }
    }

    public class RaceSimulateFrameData
    {
        [JsonProperty("time")]
        public float time { get; set; }
        [JsonProperty("horse_frame")]
        public List<RaceSimulateHorseFrameData> horse_frame { get; set; } = new List<RaceSimulateHorseFrameData>();
    }

    public class RaceSimulateHorseResultData
    {
        [JsonProperty("finish_order")]
        public int finish_order { get; set; }
        [JsonProperty("finish_time")]
        public float finish_time { get; set; }
        [JsonProperty("finish_diff_time")]
        public float finish_diff_time { get; set; }
        [JsonProperty("start_delay_time")]
        public float start_delay_time { get; set; }
        [JsonProperty("guts_order")]
        public byte guts_order { get; set; }
        [JsonProperty("wiz_order")]
        public byte wiz_order { get; set; }
        [JsonProperty("last_spurt_start_distance")]
        public float last_spurt_start_distance { get; set; }
        [JsonProperty("running_style")]
        public byte running_style { get; set; }
        [JsonProperty("defeat")]
        public int defeat { get; set; }
        [JsonProperty("finish_time_raw")]
        public float finish_time_raw { get; set; }
    }

    public class RaceSimulateEventData
    {
        [JsonProperty("frame_time")]
        public float frame_time { get; set; }
        [JsonProperty("type")]
        public sbyte type { get; set; }
        [JsonProperty("param_count")]
        public sbyte param_count { get; set; }
        [JsonProperty("param")]
        public List<int> param { get; set; } = new List<int>();
    }

    public class RaceSimulateEventDataWrapper
    {
        [JsonProperty("event_size")]
        public short event_size { get; set; }
        [JsonProperty("event")]
        public RaceSimulateEventData @event { get; set; } = new RaceSimulateEventData();
    }

    public class RaceSimulateData
    {
        [JsonProperty("header")]
        public RaceSimulateHeaderData header { get; set; } = new RaceSimulateHeaderData();
        [JsonProperty("distance_diff_max")]
        public float distance_diff_max { get; set; }
        [JsonProperty("horse_num")]
        public int horse_num { get; set; }
        [JsonProperty("horse_frame_size")]
        public int horse_frame_size { get; set; }
        [JsonProperty("horse_result_size")]
        public int horse_result_size { get; set; }
        [JsonProperty("__padding_size_1")]
        public int __padding_size_1 { get; set; }
        [JsonProperty("frame_count")]
        public int frame_count { get; set; }
        [JsonProperty("frame_size")]
        public int frame_size { get; set; }
        [JsonProperty("frame")]
        public List<RaceSimulateFrameData> frame { get; set; } = new List<RaceSimulateFrameData>();
        [JsonProperty("__padding_size_2")]
        public int __padding_size_2 { get; set; }
        [JsonProperty("horse_result")]
        public List<RaceSimulateHorseResultData> horse_result { get; set; } = new List<RaceSimulateHorseResultData>();
        [JsonProperty("__padding_size_3")]
        public int __padding_size_3 { get; set; }
        [JsonProperty("event_count")]
        public int event_count { get; set; }
        [JsonProperty("event")]
        public List<RaceSimulateEventDataWrapper> @event { get; set; } = new List<RaceSimulateEventDataWrapper>();
    }
}
