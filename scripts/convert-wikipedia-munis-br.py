# -*- coding: utf-8 -*-

import csv, re
import private
import brazil
import unicodedata

MUNIS_WIKI = (
	private.OUTPUT_SHAPEFILE_PATH +
	'/csv/brazil-municipalities.wiki'
)
TSE_CSV = private.OUTPUT_SHAPEFILE_PATH + '/csv/brazil_codes.csv'
MISSING_CSV = private.OUTPUT_SHAPEFILE_PATH + '/csv/brazil_missing.csv'

MUNIS_CSV = MUNIS_WIKI.replace( '.wiki', '.csv' )

rowspans = []

writer = csv.writer( file(MUNIS_CSV,'wb') )
writer.writerow([
	'region',
	'idstate', 'abbrstate', 'state',
	'muni', 'tsecod'
])

codemap = {
	'DF': {}
}
missing = csv.writer (file (MISSING_CSV, 'wb') )
missing.writerow(['state', 'original', 'uppercased'])
def readCodes():
	codes = csv.reader( file(TSE_CSV, 'rb') )
	for row in codes:
		statemap = codemap.get(row[0])
		if not statemap:
			codemap[row[0]] = statemap = {}
		muni = unescape(row[1].replace('&apos;', '\'').decode('iso-8859-1')).upper()
		statemap[muni] = row[2]
		#print 'Muni code for %s (%s, %s): %s' % (muni.encode('utf-8'), row[1], row[0], row[2])

def unescape( uni ):
	return ''.join([c for c in unicodedata.normalize('NFD', uni) if unicodedata.category(c) != 'Mn'])

def writeFile( filename, data ):
	''' Write data to the named file. '''
	f = open( filename, 'wb' )
	f.write( data )
	f.close()


def initLineTypes( lineTypes ):
	return map( initLineType, lineTypes )


def initLineType( lineType ):
	return [ re.compile( lineType[0] ), lineType[1] ]


def process():
	lineTypes = initLineTypes( LINE_TYPES )
	for line in open( MUNIS_WIKI ):
		line = line.strip()
		for lineType in lineTypes:
			match = lineType[0].match(line)
			if match:
				lineType[1]( match )
				break


def doRegion( match ):
	global region, rowspans
	region = match.group(1).split('|')[1]
	rowspans = []


def doState( match ):
	global rowspans, stateAbbr, stateName
	s = afterBar( match.group(1) )
	m = reState.match( afterBar( match.group(1) ) )
	stateAbbr = m.group(2)
	stateName = m.group(1)
	rowspans = []
	#print 'State codes for %s: %s' % (stateAbbr, codemap.get(stateAbbr))


def doRowspanCell( match ):
	rowspans.append({
		'count': int( match.group(1) ),
		'name': afterBar( match.group(2) )
	})


def doCell( match ):
	rowspans.append({
		'count': 1,
		'name': afterBar( match.group(1) )
	})


def getCod( key ):
	map = codemap[stateAbbr];
	if key in map:
		return map[key]
	key = key.replace('D\'', 'DO ')
	if key in map:
		return map[key]
		

def doEndRow( match ):
	if len(rowspans) != 3:
		return
	meso = rowspans[0]['name']
	micro = rowspans[1]['name']
	muni = rowspans[2]['name']
	key = unescape(muni.decode('utf-8')).upper()
	cod = getCod(key)
	if not cod:
		print 'Muni codes for %s (%s, %s): %s' % (key.encode('utf-8'), muni, stateAbbr, cod)
		missing.writerow([stateAbbr, muni, key.encode('utf-8')])
		cod = '00000'
	#print '%s | %s | %s | %s | %s | %s' %( region, stateAbbr, stateName, meso, micro, muni )
	writer.writerow([
		region,
		brazil.STATE_ABBR_TO_ID[stateAbbr], stateAbbr, stateName,
		muni, cod
	])
	cleanRow()


def cleanRow():
	for rowspan in reversed(rowspans):
		rowspan['count'] -= 1
		if rowspan['count'] == 0:
			rowspans.pop()


LINE_TYPES = [
	[ '^==\[\[(.+)\]\]==$', doRegion ],
	[ '^===\[\[(.+)\]\]===$', doState ],
	[ '^\|[-}]', doEndRow ],
	[ '^\|rowspan=(\d+)\|(.+)$', doRowspanCell ],
	[ '^\|\[\[(.+)\]\]', doCell ],
	[ '^\|(.+)', doCell ],
]

reBarSplit = re.compile( '^(.*\|)?(.*)$' )
reState = re.compile( '^(.*) \((.*)\)$' )


def afterBar( s ):
	return reBarSplit.match(s).group(2)


def main():
	readCodes()
	process()
	print 'Done!'


if __name__ == "__main__":
	main()
