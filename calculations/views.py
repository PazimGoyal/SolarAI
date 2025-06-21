import json

from django.http import JsonResponse, HttpResponse

from .pvlib_cal import *


def index(request):
    if request == "GET":
        return HttpResponse("HELLO ")
    else:
        try:
            request_body = json.loads(request.body)
            latitude = float(request_body.get("latitude", 0))
            longitude = float(request_body.get("longitude", 0))
            offset = float(request_body.get("offset", 0))


            solpos = get_optimal_tilt(latitude, longitude)
            return JsonResponse(solpos)
        except Exception as e:
            return JsonResponse({"Error": str(e)})
