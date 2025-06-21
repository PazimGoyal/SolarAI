from django.http import JsonResponse, HttpResponse

from .pvlib_cal import *


def index(request):
        latitude = 43.7
        longitude = -79.42
        solpos = get_optimal_tilt(latitude, longitude)
        return JsonResponse(solpos)
