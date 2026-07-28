#!/usr/bin/env python3
"""Export PNG RGBA as JSON for imagetracerjs."""
import base64
import json
import struct
import sys
import zlib


def read_png(path: str) -> tuple[int, int, bytes]:
    with open(path, "rb") as f:
        f.read(8)
        width = height = 0
        data = b""
        while True:
            length_bytes = f.read(4)
            if len(length_bytes) < 4:
                break
            length = struct.unpack(">I", length_bytes)[0]
            chunk_type = f.read(4)
            chunk = f.read(length)
            f.read(4)
            if chunk_type == b"IHDR":
                width, height = struct.unpack(">II", chunk[:8])
            elif chunk_type == b"IDAT":
                data += chunk
            elif chunk_type == b"IEND":
                break
    raw = zlib.decompress(data)
    stride = width * 4
    pixels = bytearray()
    idx = 0
    prev = bytearray(stride)
    for _ in range(height):
        filt = raw[idx]
        idx += 1
        row = bytearray(raw[idx : idx + stride])
        idx += stride
        if filt == 1:
            for i in range(4, len(row)):
                row[i] = (row[i] + row[i - 4]) & 255
        elif filt == 2:
            for i in range(len(row)):
                row[i] = (row[i] + prev[i]) & 255
        elif filt == 3:
            for i in range(len(row)):
                left = row[i - 4] if i >= 4 else 0
                row[i] = (row[i] + ((left + prev[i]) // 2)) & 255
        elif filt == 4:
            for i in range(len(row)):
                a = row[i - 4] if i >= 4 else 0
                b = prev[i]
                c = prev[i - 4] if i >= 4 else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                row[i] = (row[i] + pr) & 255
        prev = row
        pixels.extend(row)
    return width, height, bytes(pixels)


def main() -> None:
    path = sys.argv[1]
    width, height, pixels = read_png(path)
    payload = {
        "width": width,
        "height": height,
        "data": base64.b64encode(pixels).decode("ascii"),
    }
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
