# -*- coding: utf-8 -*-
'''
	private.py
'''

import logging, argparse
from urlparse import urlparse


FLAGS = argparse.ArgumentParser()
FLAGS.add_argument("--loglevel", help="The logging level.", default='INFO')
FLAGS.args = FLAGS.parse_args()
FLAGS.loglevel = FLAGS.args.loglevel

api_root = 'http://fusiontables.googleusercontent.com/fusiontables/api/query'
polling_uri_path = 'https://pollinglocation.googleapis.com/results'

tables = {
	'NH': {
		'town': 'YOUR_FUSION_TABLE_ID',
	},
}

whitelist = [
	'//google.com',
	'//google.com.br',
	'//ebc.com.br',
	'//estadao.com.br',
	'//tvcultura.com.br',
	'//cmais.com.br',
	#'//localhost',
]

testlistgood = [
	'http://www.google.com/elections/ed/us/results/',
	'http://www.ebc.com.br/noticias/eleicoes-2012/2012/10/acompanhe-os-resultados-da-votacao-no-mapa'
	
	# Wrong cases - uncomment for deliberate errors to test the test code
	#'http://example.com/',
]

testlistbad = [
	'http://example.com/',
	
	# Wrong cases - uncomment for deliberate errors to test the test code
	#'http://www.google.com/elections/ed/us/results/',
]

def checkRefererURL( referer, required ):
	if not referer:
		logging.error('Empty referer required: %s' % required)
		return not required
	ref = urlparse( referer )
	if not ref:
		logging.error('Could not parse URL: "%s" ' % str(referer))
		return False
	for goodURL in whitelist:
		good = urlparse( goodURL )
		logging.debug('matching referer: %s to good: %s' % (referer, goodURL))
		if matchingUrls( good, ref ):
			logging.debug('Matched good URL: %s' % referer)
			return True
	return False



def matchingUrls( good, url ):
	if good.scheme and url.scheme != good.scheme:
		logging.debug('scheme did not match: "%s"' % good.scheme)
		return False
	if good.hostname and not url.hostname.endswith(good.hostname):
		logging.debug('hostname %s did not match: "%s"' % (url.hostname, good.hostname))
		return False
	if good.port and url.port != good.port:
		logging.debug('port did not match: "%s"' % good.port)
		return False
	if good.path and not url.path.startswith(good.path):
		logging.debug('path did not match: "%s"' % good.path)
		return False
	return True


def test():
	failed = []
	logging.info( 'Testing good list' )
	for url in testlistgood:
		if not checkRefererURL( url, True ):
			failed.append(url)
			logging.error( 'Good list fail: %s' % url )
	logging.info( 'Testing bad list' )
	for url in testlistbad:
		if checkRefererURL( url, True ):
			failed.append(url)
			logging.error( 'Bad list fail: %s' % url )
	if len(failed) > 0:
		logging.info( 'FAIL : %s' % failed )
	else:
		logging.info( 'SUCESS' )


if __name__ == '__main__':
	logging.basicConfig(level=getattr(logging, FLAGS.loglevel))
	test()
