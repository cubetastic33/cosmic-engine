"""
Scrapes information about all datasets from SCS, SIAP, and SSA and saves it to a pickle file.
"""

import requests
import pickle as pkl
from bs4 import BeautifulSoup

datasets = {}

for service in ['SCS', 'SIAP', 'SSA']:

    datasets[service] = []

    for page in range(10):

        # URL creation
        url = 'http://vao.stsci.edu/keyword-search/?f[capabilityType_facet][]='
        if service == 'SCS':
            url += 'Simple+Cone+Search'
        elif service == 'SIAP':
            url += 'Simple+Image+Access+Protocol'
        elif service == 'SSA':
            url += 'Simple+Spectral+Access'
        else:
            print('Unknown service \"' + service + '\". Skipping.')
            continue
        url += '&page=' + str(page + 1)
        url += '&per_page=100&q=nasa.heasarc&search_field=id_text'

        # Fetch the webpage and parse
        r = requests.get(url)
        soup = BeautifulSoup(r.content, 'html5lib')

        # Find all catalog <dl>
        dataset_dls = soup.findAll('dl', {'class' : 'document-metadata dl-horizontal dl-invert'})

        # Loop through all catalogs
        for dataset_dl in dataset_dls:

            dataset_id = dataset_dl.findAll('dd', {'class' : 'blacklight-id'})[0].get_text()
            dataset_id = dataset_id[dataset_id.rindex('/') + 1:]

            datasets[service].append({
                'id' : dataset_id,
                'name' : dataset_dl.findAll('dd', {'class' : 'blacklight-title_t'})[0].get_text(),
                'short-name' : dataset_dl.findAll('dd', {'class' : 'blacklight-shortname_t'})[0].get_text(),
                'date': dataset_dl.findAll('dd', {'class' : 'blacklight-date'})[0].get_text(),
                'publisher' : dataset_dl.findAll('dd', {'class' : 'blacklight-publisher_t'})[0].get_text(),
                'desc' : dataset_dl.findAll('dd', {'class' : 'blacklight-description_s'})[0].get_text()
            })

        print('Completed ' + str(page + 1) + ' page' + ('s' if page > 0 else '') + ' for service ' + service + '.    ', end='\r')

    print('Completed webscraping for service ' + service + '.          ')

# Dump to pickle file
pkl.dump(datasets, open('datasets_info.pkl', 'wb'))
