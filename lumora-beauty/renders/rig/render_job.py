"""
render_job.py - render a Lumora rig job file.

    <venv>/bin/python render_job.py job.json [job2.json ...]
        [--quality draft|preview|final] [--res 2048] [--samples 512] [--out path.png]
        [--save-blend scene.blend] [--threads 3]

Relative paths inside a job (labels, output, cache_dir) resolve against the job file's folder.
See README.md for the job schema.
"""
import argparse
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import lumora_rig as rig  # noqa: E402


def main(argv=None):
    ap = argparse.ArgumentParser(description="Render Lumora packshot / still-life jobs with Blender Cycles.")
    ap.add_argument("jobs", nargs="+", help="job .json files")
    ap.add_argument("--quality", choices=sorted(rig.QUALITY), help="preset for resolution, samples and noise threshold")
    ap.add_argument("--res", type=int, help="long edge in pixels (overrides job and quality)")
    ap.add_argument("--samples", type=int, help="max samples per pixel (adaptive sampling stops earlier)")
    ap.add_argument("--out", help="output image path (single job only)")
    ap.add_argument("--save-blend", help="also save the built scene as a .blend (single job only)")
    ap.add_argument("--threads", type=int, help="render threads (default from job, else 3)")
    a = ap.parse_args(argv)
    if (a.out or a.save_blend) and len(a.jobs) > 1:
        ap.error("--out/--save-blend need a single job")
    total = time.time()
    for path in a.jobs:
        with open(path) as fh:
            job = json.load(fh)
        if a.threads:
            job.setdefault("render", {})["threads"] = a.threads
        out, dt = rig.run_job(job, os.path.dirname(os.path.abspath(path)), output=a.out, quality=a.quality,
                              resolution=a.res, samples=a.samples, save_blend=a.save_blend)
        print(f"OK {path} -> {out} ({dt:.1f}s render)", flush=True)
    print(f"done in {time.time() - total:.1f}s", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] if "--" not in sys.argv else sys.argv[sys.argv.index("--") + 1:])
