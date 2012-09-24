# -*- coding: utf-8 -*-

import csv, re
import private
import brazil

MUNIS_WIKI = (
	private.OUTPUT_SHAPEFILE_PATH +
	'/csv/brazil-municipalities.wiki'
)

MUNIS_CSV = MUNIS_WIKI.replace( '.wiki', '.csv' )

rowspans = []

writer = csv.writer( file(MUNIS_CSV,'wb') )
writer.writerow([
	'region',
	'idstate', 'abbrstate', 'state',
	'meso', 'micro', 'muni', 'capital'
])

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


def doEndRow( match ):
	if len(rowspans) != 3:
		return
	meso = rowspans[0]['name']
	micro = rowspans[1]['name']
	muni = rowspans[2]['name']
	capital = 'f'
	if brazil.CAPITALS[stateAbbr] == muni:
		capital = 't'
	#print '%s | %s | %s | %s | %s | %s' %( region, stateAbbr, stateName, meso, micro, muni )
	writer.writerow([
		region,
		brazil.STATE_ABBR_TO_ID[stateAbbr], stateAbbr, stateName,
		meso, micro, muni, capital
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
	process()
	print 'Done!'


if __name__ == "__main__":
	main()
