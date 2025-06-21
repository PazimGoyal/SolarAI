import logging as log

import pvlib
import pandas as pd
import numpy as np

from Aerialytic import settings

SolarAnywhere_Key = settings.SOLAR_ANYWHERE_KEY


def get_optimal_tilt(latitude, longitude):
    # tilt = latitude * 0.76 + 3.1  # NREL approximate annual optimal tilt

    """
    For summer: tilt = latitude - 15

    For winter: tilt = latitude + 15
    """

    times = pd.date_range("2024-06-21", "2024-06-21 23:59", freq="30min", tz='UTC')
    altitude = 100  # in meters
    # get_solar_intensity(latitude, longitude, '2025-01-01T00:00:00Z', '2025-06-30T23:59:00Z')

    # Call SPA for high-precision solar position
    # solpos = pvlib.solarposition.spa_python(times, latitude, longitude, altitude)
    # return solpos
    tz = 'America/Toronto'

    site = pvlib.location.Location(latitude, longitude, tz=tz)

    # --- Time and solar data ---
    times = pd.date_range('2025-01-01', '2025-12-31', freq='h', tz=tz)
    solar_pos = site.get_solarposition(times)
    clearsky = site.get_clearsky(times)

    # --- Optimize tilt ---
    tilts = np.arange(0, 91, 1)  # 0 to 90 degrees
    best_tilt = 0
    max_poa = 0

    for tilt in tilts:
        poa = pvlib.irradiance.get_total_irradiance(
            surface_tilt=tilt,
            surface_azimuth=180,  # South-facing (fixed azimuth)
            dni=clearsky['dni'],
            ghi=clearsky['ghi'],
            dhi=clearsky['dhi'],
            solar_zenith=solar_pos['apparent_zenith'],
            solar_azimuth=solar_pos['azimuth']
        )['poa_global']

        total_poa = poa.sum()
        if total_poa > max_poa:
            max_poa = total_poa
            best_tilt = tilt

    return {"best_tilt": float(best_tilt),
            "max_poa": float(max_poa)}


def get_solar_intensity(latitude, longitude, start, end):
    """
    solar anywhere api

    problems with API key.

    :param latitude:
    :param longitude:
    :param times:
    :return:
    """

    start = pd.Timestamp(start)
    end = pd.Timestamp(end)
    try:
        solar_insolation_intensity = pvlib.iotools.get_solaranywhere(latitude, longitude, SolarAnywhere_Key,
                                                                     start=start, end=end,
                                                                     source='SolarAnywhereLatest',
                                                                     time_resolution=60, spatial_resolution=0.1,
                                                                     true_dynamics=False,
                                                                     probability_of_exceedance=None,
                                                                     missing_data='FillAverage',
                                                                     url='https://service.solaranywhere.com/api/v2',
                                                                     map_variables=True, timeout=300)
    except Exception as e:
        log.error(str(e))

    return solar_insolation_intensity
