import re
import requests
import numpy as np
import pandas as pd
import pickle as pkl
import xml.etree.ElementTree as ET

from astropy.coordinates import SkyCoord

def catalog_search(search_term):

    pass

def name_to_coords(obj_name):

    """
    Returns right ascension and declination.

    Parameter:
    - obj_name: Name of astronomical object

    Returns:
    - Right Ascension
    - Declination
    """

    coords = SkyCoord.from_name(obj_name)
    coords = coords.to_string('decimal').sep(' ')
    coords = [float(i) for i in coords]

    return coords[0], coords[1]

def service_heasarc(service, SoT_name, RA, DEC, SR):

    """
    Returns data from HEASARC provided search paramters.

    Parameters:
    - service: SCS (Simple Cone Search), SIAP (Simple Image Access Protocol), SSA (Simple Spectral Access) [str]
    - SoT_name: Name of service or table [str]
    - RA: Right Ascension [float]
    - DEC: Declination [float]
    - SR: Search Radius [float]

    Returns:
    - Pandas DataFrame with all the data [pandas.DataFrame]
    - Column info dictionary with additional information on each column [dict]
    - URL source of XML file
    """

    service = service.upper()

    # Choose URL on the basis of parameters
    if service == 'SCS':
        fetch_url = 'https://heasarc.gsfc.nasa.gov/xamin/vo/cone?showoffsets&table=' + str(SoT_name)
        fetch_url += '&RA=' + str(RA) + '&DEC=' + str(DEC) + '&SR=' + str(SR)
        service_format_idx = 1
    elif service == 'SIAP':
        fetch_url = 'https://skyview.gsfc.nasa.gov/current/cgi/vo/sia.pl?survey=' + str(SoT_name)
        fetch_url += '&POS=' + str(RA) + ',' + str(DEC) + '&SIZE=' + str(SR)
        service_format_idx = -2
    elif service == 'SSA':
        fetch_url = 'https://heasarc.gsfc.nasa.gov/xamin/vo/ssa?table=' + str(SoT_name)
        fetch_url += '&POS=' + str(RA) + ',' + str(DEC) + '&SIZE=' + str(SR)
        service_format_idx = 2
    else:
        print('Error: Unknown service \"' + service + '\" provided.')
        return None

    # Perform query, recieve XML file and parse
    xml_dat = requests.get(fetch_url)
    xml_root = ET.fromstring(xml_dat.content)[0][service_format_idx]

    col_names, col_info = [], {}
    rows = None

    # Load column names
    if service == 'SIAP':
        for c in xml_root[:-1]:
            col_names.append(c.attrib['name'])
    else:
        for c in xml_root[:-1]:
            if re.sub(r'\s*{.*}\s*', '', c.tag) == 'FIELD':
                col_names.append(c.attrib['name'])
                col_info[col_names[-1]] = c.attrib
                if len(c) > 0:
                    col_info[col_names[-1]]['desc'] = c[0].text
                del col_info[col_names[-1]]['name']

    # Load data/rows
    for c in xml_root[-1][0]:
        row = []
        for gc in c:
            row.append(gc.text)
        row = np.asarray([row])
        rows = row if rows is None else np.concatenate((rows, row), axis=0)

    return pd.DataFrame(data=rows, columns=col_names), col_info, fetch_url

if __name__ == "__main__":

    print(name_to_coords('m51'))
