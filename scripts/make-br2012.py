# -*- coding: utf-8 -*-

import pg, private

#import cProfile

database = 'brazil2012'
schema = 'br'
geom = 'geom'
boxGeom = geom


def createDatabase( database ):
	print 'Creating database %s' % database
	db = pg.Database( database='postgres' )
	db.createGeoDatabase( database )
	db.connection.close()


def openDatabase( database ):
	print 'Opening database %s' % database
	return pg.Database( database=database )


def closeDatabase( db ):
	db.connection.commit()
	db.connection.close()


def createSchema( db ):
	print 'Creating schema %s' % schema
	db.createSchema( schema )
	db.connection.commit()


def loadBrazilStateTable( db ):
	db.loadCsvTable(
		'../shapes/csv/brazil-states.csv',
		'br.statelist',
		'id, abbr, name',
		'''
			id varchar(2),
			abbr varchar(2),
			name varchar(60)
		'''
	)
	db.executeCommit( '''
		CREATE INDEX ON br.statelist(id);
		CREATE INDEX ON br.statelist(abbr);
		CREATE INDEX ON br.statelist(name);
	''' )


def loadBrazilMuniTable( db ):
	db.loadCsvTable(
		'../shapes/csv/brazil-municipalities.csv',
		'br.munilist',
		'region, idstate, abbrstate, state, meso, minor, muni',
		'''
			region varchar(30),
			idstate varchar(2),
			abbrstate varchar(2),
			state varchar(60),
			meso varchar(60),
			minor varchar(60),
			muni varchar(60)
		'''
	)
	db.executeCommit( '''
		ALTER TABLE br.munilist ADD COLUMN idmuni varchar(7);
		ALTER TABLE br.munilist ADD COLUMN ttymuni varchar(60);
		UPDATE br.munilist
		SET ttymuni = upper( unaccent(muni) );
		
		CREATE INDEX ON br.munilist(region);
		CREATE INDEX ON br.munilist(idstate);
		CREATE INDEX ON br.munilist(abbrstate);
		CREATE INDEX ON br.munilist(state);
		CREATE INDEX ON br.munilist(meso);
		CREATE INDEX ON br.munilist(minor);
		CREATE INDEX ON br.munilist(idmuni);
		CREATE INDEX ON br.munilist(ttymuni);
	''' )


def loadBrazilMuniShapes( db ):
	table = 'br.munishape'
	zipfile = 'brazil-2048'
	filename = '../shapes/shp/%s.zip' % zipfile
	print 'Loading %s' % filename
	db.loadShapefile(
		filename, private.TEMP_PATH, table,
		geom, '3857', 'LATIN1', True,
		'%s.shp' % zipfile
	)
	db.executeCommit( '''
		ALTER TABLE br.munishape ADD COLUMN tty_municip varchar(60);
		UPDATE br.munishape
		SET tty_municip = upper( unaccent(nm_municip) );
		
		CREATE INDEX ON br.munishape(cd_geocodm);
		CREATE INDEX ON br.munishape(tty_municip);
	''' )


def updateBrazilMuniTable( db ):
	db.executeCommit( '''
		UPDATE br.munilist
		SET idmuni = (
			SELECT cd_geocodm
			FROM br.munishape
			WHERE substring( cd_geocodm for 2 ) = idstate
			AND tty_municip = ttymuni
		);
		
		CREATE VIEW br.muni
		AS SELECT
			region, idstate, abbrstate, state, meso, minor, muni, idmuni, ttymuni, (
				SELECT geom FROM br.munishape WHERE cd_geocodm = idmuni
			) AS geom
		FROM br.munilist;
	''' )


def mergeAllGeometries( db ):
	mergeLocalGeometry( db, 'minor' )
	mergeLocalGeometry( db, 'meso' )
	mergeLocalGeometry( db, 'state' )
	mergeNationalGeometry( db, 'region' )
	mergeNationalGeometry( db, 'nation', "'BR'" )


def mergeLocalGeometry( db, col ):
	mergeGeometryTable( db, 'br.muni', 'br.%s' % col,
		'abbrstate, %s' % col,
		'abbrstate varchar(2), %s varchar(60)' % col,
		'GROUP BY br.muni.abbrstate, br.muni.%s' % col
	)


def mergeNationalGeometry( db, col, id=None ):
	if col == 'nation':
		groupBy = ''
	else:
		groupBy = 'GROUP BY br.muni.%s' % col
	mergeGeometryTable( db, 'br.muni', 'br.%s' % col,
		'%s' % ( id or col ),
		'%s varchar(60)' % col,
		groupBy
	)


def mergeGeometryTable( db, sourceTable, targetTable, cols, columns, whereGroupBy ):
	db.createMergedGeometryTable(
		sourceTable, geom, targetTable, geom,
		cols, columns, whereGroupBy
	)


def writeNation( db ):
	geoid = 'BR'
	geoState = db.makeFeatureCollection(
		'br.state',
		boxGeom, geom, geoid, 'Brazil',
		'abbrstate', 'state', 'abbrstate'
	)
	geoRegion = db.makeFeatureCollection(
		'br.region',
		boxGeom, geom, geoid, 'Brazil',
		'region', 'region', 'region'
	)
	geoNation = db.makeFeatureCollection(
		'br.nation',
		boxGeom, geom, geoid, 'Brazil',
		'nation', 'nation', 'nation'
	)
	geo = {
		'nation': geoNation,
		'region': geoRegion,
		'state': geoState,
	}
	writeGeoJSON( db, geoid, geom, geo )


def writeEachState( db ):
	db.execute( '''
		SELECT id, abbr, name
		FROM br.statelist
		ORDER BY abbr
	''' )
	for id, abbr, name in db.cursor.fetchall():
		where = "( abbrstate = '%s' )" % abbr
		geoState = db.makeFeatureCollection(
			'br.state',
			boxGeom, geom, abbr, name,
			'abbrstate', 'state', 'abbrstate', where
		)
		geoMeso = db.makeFeatureCollection(
			'br.meso',
			boxGeom, geom, abbr, name,
			'meso', 'meso', 'abbrstate', where
		)
		geoMinor = db.makeFeatureCollection(
			'br.minor',
			boxGeom, geom, abbr, name,
			'minor', 'minor', 'abbrstate', where
		)
		geoMuni = db.makeFeatureCollection(
			'br.muni',
			boxGeom, geom, abbr, name,
			'idmuni', 'muni', 'abbrstate', where
		)
		geo = {
			'state': geoState,
			'meso': geoMeso,
			'minor': geoMinor,
			'muni': geoMuni,
		}
		writeGeoJSON( db, abbr, geom, geo )


def writeGeoJSON( db, geoid, geom, geo ):
	filename = '%s/%s-%s-%s' %(
		private.GEOJSON_PATH, schema, geoid, geom
	)
	db.writeGeoJSON( filename + '.js', geo, 'loadGeoJSON' )
	db.writeGeoJSON( filename + '.geojson', geo )


def buildDatabase( database ):
	#build = False
	build = True
	if not build:
		return openDatabase( database )
	createDatabase( database)
	db = openDatabase( database )
	db.addUtilityFunctions()
	createSchema( db )
	loadBrazilStateTable( db )
	loadBrazilMuniTable( db )
	loadBrazilMuniShapes( db )
	updateBrazilMuniTable( db )
	mergeAllGeometries( db )
	return db


def main():
	db = buildDatabase( database)
	writeNation( db )
	writeEachState( db )


if __name__ == "__main__":
	main()
	#cProfile.run( 'main()' )
