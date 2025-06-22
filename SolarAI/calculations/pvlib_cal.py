import logging as log
import pvlib
import pandas as pd
import numpy as np

from Aerialytic import settings

SolarAnywhere_Key = settings.SOLAR_ANYWHERE_KEY


def getSolarIrradianceData(latitude, longitude, times):
    data = None
    try:
        # data = get_solarAnywhere_intensity(latitude, longitude, times[0], times[-1])
        pass
    except:
        data = None

    if not data or data is None:
        site = pvlib.location.Location(latitude, longitude, tz="UTC")
        solar_pos = site.get_solarposition(times)
        clearsky = site.get_clearsky(times)

    return clearsky, solar_pos


def get_optimal_tilt(latitude, longitude, offset_angle):
    # tilt = latitude * 0.76 + 3.1  # NREL approximate annual optimal tilt

    """
    For summer: tilt = latitude - 15

    For winter: tilt = latitude + 15
    """
    times = pd.date_range('2025-01-01', '2025-12-31', freq='h', tz="UTC")

    clearsky, solar_pos = getSolarIrradianceData(longitude=longitude, latitude=latitude, times=times)
    # --- Optimize tilt ---
    tilts = np.arange(0, 91, 5)  # 0 to 90 degrees
    azimuth_range = np.arange(90, 271, 10)  # sweep east to west

    best_total_irradiance = 0
    best_tilt = 0
    best_azimuth = 180  # fallback

    for tilt in tilts:
        for azimuth in azimuth_range:
            effective_tilt = tilt + offset_angle
            poa = pvlib.irradiance.get_total_irradiance(
                surface_tilt=effective_tilt,
                surface_azimuth=azimuth,
                dni=clearsky['dni'],
                ghi=clearsky['ghi'],
                dhi=clearsky['dhi'],
                solar_zenith=solar_pos['apparent_zenith'],
                solar_azimuth=solar_pos['azimuth']
            )['poa_global']

            total_poa = poa.sum()
            if total_poa >= best_total_irradiance:
                best_total_irradiance = total_poa
                best_tilt = tilt
                best_azimuth = azimuth
            # print(f"found best for tilt {tilt} effective tilt : {effective_tilt} best irraduance : {best_total_irradiance} or {total_poa} ... best tilt {best_tilt} and best azimuth {best_azimuth}" )

    # Return optimal tilt and azimuth

    optimal_tilt = f' Tilt : {round(best_tilt, 2)} deg + offset : {offset_angle} deg = {round(best_tilt, 2) + offset_angle}'
    times = pd.date_range('2025-01-01', '2025-12-31', freq='6h', tz="UTC")
    clearsky, _ = getSolarIrradianceData(longitude=longitude, latitude=latitude, times=times)
    ghi = clearsky['ghi'].tolist()
    dni = clearsky['dni'].tolist()
    dhi = clearsky['dhi'].tolist()
    timestamps = times.strftime('%m/%d/%Y , %H:%M').tolist()

    return {
        'optimal Tilt': optimal_tilt,
        'optimal Azimuth': float(best_azimuth),
        'Best Total Irradiance': float(total_poa),
        "tab_GHI": ghi,
        "tab_DNI":dni,
        "tab_DHI":dhi,
        "tab_timestamp": timestamps
    }


def get_solarAnywhere_intensity(latitude, longitude, start, end):
    """
    solar anywhere api

    problems with API key.

    :param latitude:
    :param longitude:
    :param times:
    :return:
    """
    try:
        start = pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=1)
        end = pd.Timestamp.now(tz="UTC")
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
        return None

    return solar_insolation_intensity
