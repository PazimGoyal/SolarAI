from django.http import JsonResponse

import pvlib #using pvlib liberary
import pandas as pd #using pandas
from datetime import datetime as dt


coordinates = {
    "x": 43.704698,
    "y": -79.755772

}


def index(request):
    # return render(request,"")
    answer = {
        "a": 23,
        "b": 43
    }
    return JsonResponse(answer)
