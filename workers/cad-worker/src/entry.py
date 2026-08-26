"""Nusantara CAD Worker — DXF 户型解析（Python + ezdxf，WorkerEntrypoint 新语法）"""
import json

from workers import WorkerEntrypoint, Response

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def _json(data, status=200):
    return Response(
        json.dumps(data, ensure_ascii=False),
        status=status,
        headers={"Content-Type": "application/json; charset=utf-8", **CORS},
    )


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        if request.method == "OPTIONS":
            return Response(None, status=204, headers=CORS)
        if request.method != "POST" or not request.url.path.endswith("/parse-dxf"):
            return _json({"success": False, "error": {"code": "NOT_FOUND", "message": "not found"}}, 404)
        try:
            import io
            import ezdxf

            text = await request.text()
            doc = ezdxf.read(io.StringIO(text))
            rooms = []
            for e in doc.modelspace().query("LWPOLYLINE"):
                pts = [(p[0], p[1]) for p in e.get_points()]
                if len(pts) < 3:
                    continue
                n = len(pts)
                area = abs(sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))) / 2
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                rooms.append({
                    "name": e.dxf.layer,
                    "width": round(max(xs) - min(xs), 2),
                    "depth": round(max(ys) - min(ys), 2),
                    "area": round(area, 2),
                })
            return _json({"success": True, "data": {"rooms": rooms, "total_area": round(sum(r["area"] for r in rooms), 2)}})
        except Exception as exc:  # noqa: BLE001
            return _json({"success": False, "error": {"code": "PARSE_ERROR", "message": str(exc)}}, 400)
