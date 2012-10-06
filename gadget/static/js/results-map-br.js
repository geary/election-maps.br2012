// results-map.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

var times = {
	gadgetLoaded: now(),
	offset: 0
};

// Default params
var defaultElectionKey = '2012';
params.year = params.year || '2012';
params.contest = params.contest || 'mayor';
params.round = params.round || '1';

params.source = '';

var hostPrefix = location.host.split('.')[0];
var match = hostPrefix.match( /^([a-z][a-z])2012(-\w+)$/ );
if( match ) {
	if( hostPrefix == 'nv2012' ) params.source = 'gop';
	params.state = match[1];
}
var $body = $('body');

// Hide Google Elections logo in IE <= 7
if( $.browser.msie ) {
	if( +$.browser.version.split('.')[0] <= 7 )
		$body.addClass( 'ie7' );
}

candidates2012.index('id');
parties2012.index('id');

opt.randomized = params.randomize || params.zero;

var electionKey, election;
setElection();

function setElection() {
	electionKey = [ params.year, params.contest, params.round ].join( '-' );
	election = elections[electionKey] || elections[defaultElectionKey];
}

function longDateFromYMD( yyyymmdd ) {
	var ymd = yyyymmdd.split('-'), year = ymd[0];
	if( ymd.length == 1 ) return year;
	return 'dateFormat'.T({
		year: year,
		monthName: ( 'monthName' + ymd[1] ).T(),
		dayOfMonth: +ymd[2]
	});
}

if( params.date ) {
	var d = dateFromYMD( params.date, election.tzHour, election.tzMinute );
	times.offset = d - times.gadgetLoaded;
}

var current = {
	geoid: 'BR',
	national: true
};

//states.index('abbr').index('electionid').index('fips');

//for( var state, i = -1;  state = states[++i]; ) {
//	state.dateUTC = dateFromYMD( state.date, election.tzHour, election.tzMinute );
//}

//params.state = params.state || params.embed_state;
////params.state = params.state || 'zz';
//if( ( params.state || '' ).toLowerCase() == 'us' ) delete params.state;

//function State( abbr ) {
//	if( abbr && abbr.bbox && abbr.id ) abbr = abbr.id.split('US')[1].slice(0,2);
//	abbr = ( abbr || params.state || 'US' ).toUpperCase();
//	var state =
//		states.by.fips[abbr] ||
//		states.by.abbr[abbr] ||
//		states.by.electionid[abbr] ||
//		stateUS;
//	state.electionTitle = S( state.name, ' ', state.type || 'primary'.T() );
//	state.getResults = function() {
//		return ( this == stateUS  &&  view == 'county' ) ?
//			this.resultsCounty :
//			this.results;
//	};
//	return state;
//}
//
//var stateUS = State('US'), state = State();

//if( PolyGonzo.isVML() ) {
//	delete params.view;  // too slow for all-county view
//}

//var view = ( params.view == 'county' || ! current.national ? 'county' : 'state' );

// Analytics
var _gaq = _gaq || [];
_gaq.push([ '_setAccount', 'UA-27854559-1' ]);
//_gaq.push([ '_setDomainName', '.election-maps.appspot.com' ]);
_gaq.push([ '_trackPageview' ]);

//function resultsFields() {
//	return S(
//		election.candidates.map( function( candidate ) {
//			return S( "'TabCount-", candidate.id, "'" );
//		}).join( ',' ),
//		',ID,TabTotal',
//		',NumBallotBoxes,NumCountedBallotBoxes'
//	);
//}

document.write(
	'<style type="text/css">',
		'html, body { margin:0; padding:0; border:0 none; }',
	'</style>'
);

var gm, gme;

var $window = $(window), ww = $window.width(), wh = $window.height();

var mapPixBounds;

var debug = params.debug;
//opt.state = params.state;
//opt.counties = !! opt.state;
//opt.candidate = '1';
//opt.zoom = opt.zoom || 3;
opt.fontsize = '15px';
var sidebarWidth = params.play ? 340 : 280;

opt.resultCacheTime = 30 * 1000;
opt.reloadTime = 60 * 1000;

// Non-auto-refresh settings to use after results are final
//opt.resultCacheTime = Infinity;  // cache forever
//opt.reloadTime = false;  // no auto-reload

var zoom;

var candidateZero = { id: '0' };
//loadCandidatePatterns();

function loadCandidatePatterns( callback ) {
	var loading = 0;
	election.candidates.forEach( loadPattern );
	loadPattern( candidateZero );
	function loadPattern( candidate ) {
		++loading;
		var pattern = candidate.pattern = new Image();
		pattern.onload = function() {
			if( --loading == 0 ) callback && callback();
		};
		pattern.src = imgUrl( 'pattern-' + candidate.id + '.png' );
	}
}

function cacheUrl( url ) {
	return opt.nocache ? S( url, '?q=', times.gadgetLoaded ) : url;
}

function imgUrl( name ) {
	return cacheUrl( 'images/' + name );
}

document.body.scroll = 'no';

document.write(
	'<style type="text/css">',
		'html, body { width:', ww, 'px; height:', wh, 'px; margin:0; padding:0; overflow:hidden; color:#222; background-color:white; }',
		'#topbar, #sidebar, #maptip { font-family: Arial,sans-serif; font-size: ', opt.fontsize, '; background-color:white; }',
		'#topbar { position:absolute; left:', sidebarWidth, 'px; top:0; width:', ww - sidebarWidth, 'px; }',
		'a { font-size:13px; text-decoration:none; color:#1155CC; }',
		'a:hover { text-decoration:underline; }',
		//'a:visited { color:#6611CC; }',
		'a.button { display:inline-block; cursor:default; background-color:whiteSmoke; background-image:linear-gradient(top,#F5F5F5,#F1F1F1); border:1px solid #DCDCDC; border:1px solid rgba(0,0,0,0.1); border-radius:2px; box-shadow:none; color:#444; font-weight:bold; font-size:11px; xheight:27px; xline-height:27px; padding:2px 6px; text-decoration:none !important; }',
		'a.button.hover { background-color: #F6F6F6; background-image:linear-gradient(top,#F8F8F8,#F1F1F1); border:1px solid #C6C6C6; box-shadow:0px 1px 1px rgba(0,0,0,0.1); color:#222; }',
		'a.button.selected { background-color: #EEE; background-image:linear-gradient(top,#EEE,#E0E0E0); border:1px solid #CCC; box-shadow:inset 0px 1px 2px rgba(0,0,0,0.1); color:#333; }',
		'a.button.disabled { color:#AAA; }',
		'#outer {}',
		'.barvote { font-weight:bold; color:white; }',
		'div.topbar-header, div.sidebar-header { padding:3px; }',
		'div.title-text { font-size:16px; }',
		'div.subtitle-text { font-size:11px; color:#777; }',
		'div.body-text, div.body-text label { font-size:13px; }',
		'div.faint-text { font-size:12px; color:#777; }',
		'div.small-text, a.small-text { font-size:11px; }',
		'.content table { xwidth:100%; }',
		'.content .contentboxtd { width:7%; }',
		'.content .contentnametd { xfont-size:24px; xwidth:18%; }',
		'.content .contentbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
		'.content .contentname { white-space:pre; }',
		'.content .contentvotestd { text-align:right; width:5em; }',
		'.content .contentpercenttd { text-align:right; width:2em; }',
		'.content .contentvotes, .content .contentpercent { xfont-size:', opt.fontsize, '; margin-right:4px; }',
		'.content .contentclear { clear:left; }',
		'.content .contentreporting { margin-bottom:8px; }',
		'.content .contentreporting * { xfont-size:20px; }',
		'.content {}',
		'div.scroller { overflow:scroll; overflow-x:hidden; }',
		'div.scroller::-webkit-scrollbar-track:vertical { background-color:#f5f5f5; margin-top:2px; }',
		'div.scroller::-webkit-scrollbar { height:16px; width:16px; }',
		'div.scroller::-webkit-scrollbar-button { height:0; width:0; }',
		'div.scroller::-webkit-scrollbar-button:start:decrement, div.scroller::-webkit-scrollbar-button:end:increment { display:block; }',
		'div.scroller::-webkit-scrollbar-button:vertical:start:increment, div.scroller::-webkit-scrollbar-button:vertical:end:decrement { display:none; }',
		'div.scroller::-webkit-scrollbar-track:vertical, div.scroller::-webkit-scrollbar-track:horizontal, div.scroller::-webkit-scrollbar-thumb:vertical, div.scroller::-webkit-scrollbar-thumb:horizontal { border-style:solid; border-color:transparent; }',
		'div.scroller::-webkit-scrollbar-track:vertical { background-clip:padding-box; background-color:#fff; border-left-width:5px; border-right-width:0; }',
		'div.scroller::-webkit-scrollbar-track:horizontal { background-clip:padding-box; background-color:#fff; border-bottom-width:0; border-top-width:5px; }',
		'div.scroller::-webkit-scrollbar-thumb { -webkit-box-shadow:inset 1px 1px 0 rgba(0,0,0,.1),inset 0 -1px 0 rgba(0,0,0,.07); background-clip:padding-box; background-color:rgba(0,0,0,.2); min-height:28px; padding-top:100px; }',
		'div.scroller::-webkit-scrollbar-thumb:hover { -webkit-box-shadow:inset 1px 1px 1px rgba(0,0,0,.25); background-color:rgba(0,0,0,.4); }',
		'div.scroller::-webkit-scrollbar-thumb:active { -webkit-box-shadow:inset 1px 1px 3px rgba(0,0,0,.35); background-color:rgba(0,0,0,.5); }',
		'div.scroller::-webkit-scrollbar-thumb:vertical { border-width:0; border-left-width:5px; }',
		'div.scroller::-webkit-scrollbar-thumb:horizontal { border-width:0; border-top-width:5px; }',
		'div.scroller::-webkit-scrollbar-track:vertical { border-left-width:6px; border-right-width:1px; }',
		'div.scroller::-webkit-scrollbar-track:horizontal { border-bottom:1px; border-top:6px; }',
		'div.scroller::-webkit-scrollbar-thumb:vertical { border-width:0; border-left-width:6px; border-right-width:1px; }',
		'div.scroller::-webkit-scrollbar-thumb:horizontal { border-width:0; border-bottom:1px; border-top:6px; }',
		'div.scroller::-webkit-scrollbar-track:hover { -webkit-box-shadow:inset 1px 0 0 rgba(0,0,0,.1); background-color:rgba(0,0,0,.05); }',
		'div.scroller::-webkit-scrollbar-track:active { -webkit-box-shadow:inset 1px 0 0 rgba(0,0,0,.14),inset -1px -1px 0 rgba(0,0,0,.07); background-color:rgba(0,0,0,.05); }',
		'#maptip { position:absolute; z-index:10; border:1px solid #333; background:white; color:#222; white-space: nowrap; display:none; min-width:300px; }',
		'div.candidate-name { line-height:1em; }',
		'div.first-name { font-size:85%; }',
		'body.tv #election-title { font-size:24px; font-weight:bold; }',
		'body.tv #election-date { font-size:16px; color:#222; }',
		'body.tv #percent-reporting { font-size:20px; }',
		'body.tv div.candidate-name { margin-right:20px; }',
		'body.tv div.candidate-name div { line-height:1.1em; }',
		'body.tv div.first-name { font-size:20px; }',
		'body.tv div.last-name { font-size:24px; font-weight:bold; }',
		'body.tv #maptip { border:none; }',
		'body.tv #map { border-left:1px solid #333; }',
		'body.tv span.tiptitletext { font-size:28px; }',
		'body.tv div.tipreporting { font-size:20px; }',
		'body.tv table.candidates td { padding:4px 0; }',
		'.tiptitlebar { padding:4px 8px; border-bottom:1px solid #AAA; }',
		'.tiptitletext { font-weight:bold; font-size:120%; }',
		'.tipcontent { padding:4px 8px 8px 8px; border-bottom:1px solid #AAA; }',
		'.tipreporting { font-size:80%; padding:2px 0; }',
		'#selectors { background-color:#D0E3F8; }',
		'#selectors, #selectors * { font-size:14px; }',
		'#selectors label { font-weight:bold; }',
		'#selectors { width:100%; /*border-bottom:1px solid #C2C2C2;*/ }',
		'body.tv #legend { margin-top:8px; }',
		'#sidebar { width:', sidebarWidth, 'px; }',
		'#sidebar table.candidates { width:100%; }',
		'table.candidates td { border-top:1px solid #E7E7E7; }',
		'#maptip table.candidates { width:100%; }',
		'#maptip table.candidates tr.first td { border-top:none; }',
		'#maptip div.candidate-delegates { font-size:130%; font-weight:bold; }',
		'.candidate-votes { font-weight:bold; min-width: 8em; }',
		'.candidate-percent { font-size:80%; }',
		'.candidate-percent { float: right; min-width: 4em; }',
		'#maptip div.click-for-local { padding:4px; }',
		'body.tv #maptip div.candidate-percent { font-size:20px; font-weight:bold; }',
		'#sidebar-scroll { padding:0 4px; }',
		'#election-title { padding-bottom:2px; }',
		'#election-date-row { display:none; }',
		'tr.legend-candidate td, tr.legend-filler td { border:1px solid white; }',
		'div.legend-candidate, div.legend-filler { font-size:13px; padding:3px 0 3px 3px; }',
		'.legend-header { font-size: 13px; color:#333; cursor: default; }',
		'.candidates .legend-header td { padding: 0 3px 3px 3px; border-top-style: none }',
		'.legend-header .right, .legend-candidate .right { text-align: right; }',
		//'body.tv div.legend-candidate, body.tv div.legend-filler { font-size:22px; }',
		'body.web div.legend-candidate { color:#333; }',
		'body.tv div.legend-candidate, body.tv div.legend-filler { font-size:21px; font-weight:bold; }',
		'td.legend-filler { border-color:transparent; }',
		//'tr.legend-candidate td { width:20%; }',
		'tr.legend-candidate td { cursor:pointer; }',
		'tr.legend-candidate.hover td { background-color:#F5F5F5; border:1px solid #F5F5F5; border-top:1px solid #D9D9D9; border-bottom:1px solid #D9D9D9; }',
		'tr.legend-candidate.hover td.left { border-left:1px solid #D9D9D9; }',
		'tr.legend-candidate.hover td.right { border-right:1px solid #D9D9D9; }',
		'tr.legend-candidate.selected td { background-color:#E7E7E7; border:1px solid #E7E7E7; border-top:1px solid #CCCCCC; border-bottom:1px solid #CCCCCC; }',
		'tr.legend-candidate.selected td.left { border-left:1px solid #CCCCCC; }',
		'tr.legend-candidate.selected td.right { border-right:1px solid #CCCCCC; }',
		'span.legend-candidate-color { font-size:15px; }',
		'#sidebar span.legend-candidate-color { font-size:16px; }',
		'body.tv span.legend-candidate-color { font-size:18px; }',
		'#centerlabel, #centerlabel * { font-size:12px; xfont-weight:bold; }',
		'#spinner { z-index:999999; position:absolute; left:', Math.floor( ww/2 - 64 ), 'px; top:', Math.floor( wh/2 - 20 ), 'px; }',
		'#error { z-index:999999; position:absolute; left:4px; bottom:4px; border:1px solid #888; background-color:#FFCCCC; font-weight:bold; padding:6px; }',
		'.logo { position:absolute; bottom:24px; height: 58px; }', // height must be the largest of all logo heights.
		'#tse-logo { right:64px; width: 42px; background: url(', imgUrl('tse-logo-42x58.png'), ') no-repeat; }',
		'#google-logo { right:4px; width: 48px; background: url(', imgUrl('google-politics-48.png'), ') no-repeat; }',
		'#copyright { position:absolute; font-family: Arial,sans-serif; font-size:13px; color:#444; text-align:right; right:2px; bottom:22px; }',
		'#gop-logo { right:64px; width:48px; background: url(', imgUrl('gop-nv-48.png'), ') no-repeat; }',
		'body.hidelogo .logo { display:none; }',
		'body.ie7 #tse-logo { right:4px; }',
		'body.ie7 #google-logo, body.ie7 #linkToMap { display:none; }',
	'</style>'
);


var index = 0;
function option( value, name, selected, disabled ) {
	var html = optionHTML( value, name, selected, disabled );
	++index;
	return html;
}

function optionHTML( value, name, selected, disabled ) {
	var id = value ? 'id="option-' + value + '" ' : '';
	var style = disabled ? 'color:#AAA; font-style:italic; font-weight:bold;' : '';
	selected = selected ? 'selected="selected" ' : '';
	disabled = disabled ? 'disabled="disabled" ' : '';
	return S(
		'<option ', id, 'value="', value, '" style="', style, '" ', selected, disabled, '>',
			name,
		'</option>'
	);
}

function stateOption( state, selected ) {
	state.selectorIndex = index;
	return option( state.id, state.name, selected );
}

document.write(
	'<div id="outer">',
	'</div>',
	'<div id="maptip">',
	'</div>',
	'<a id="tse-logo" class="logo" target="_blank" href="http://www.tse.jus.br/" title="', 'tseCopyright'.T(), '">',
	'</a>',
	'<a id="google-logo" class="logo" target="_blank" href="http://www.google.br/elections/ed/br" title="', 'googlePoliticsTitle'.T(), '">',
	'</a>',
	'<div id="error" style="display:none;">',
	'</div>',
	'<div id="spinner">',
		'<img border="0" style="width:128px; height:128px;" src="', imgUrl('spinner-124.gif'), '" />',
	'</div>'
);

function contentTable() {
	return S(
		'<div>',
			//'<div id="selectors">',
			//	'<div style="margin:0; padding:6px;">',
			//		//'<label for="stateSelector">',
			//		//	'stateLabel'.T(),
			//		//'</label>',
			//		//'<select id="stateSelector">',
			//		//	option( '-1', 'nationwideLabel'.T() ),
			//		//	option( '', '', false, true ),
			//		//	sortArrayBy( stateUS.geo.state.features, 'name' )
			//		//		.mapjoin( function( state ) {
			//		//			return stateOption(
			//		//				state,
			//		//				state.abbr == opt.state
			//		//			);
			//		//		}),
			//		//'</select>',
			//		//'&nbsp;&nbsp;&nbsp;',
			//		//'&nbsp;&nbsp;&nbsp;',
			//		//'<input type="checkbox" id="chkCounties">',
			//		//'<label for="chkCounties">', 'countiesCheckbox'.T(), '</label>',
			//	'</div>',
			//'</div>',
			'<div id="sidebar">',
				formatSidebarTable( [] ),
			'</div>',
			'<div id="topbar">',
				formatTopbar(),
			'</div>',
			'<div style="width:100%;">',
				'<div id="map" style="width:100%; height:100%;">',
				'</div>',
			'</div>',
		'</div>'
	);
}

function formatSidebarTable( cells ) {
	function filler() {
		return S(
			'<td class="legend-filler">',
				'<div class="legend-filler">',
					'&nbsp;',
				'</div>',
			'</td>'
		);
	}
	function row( cells ) {
		return S(
			'<tr>',
				cells.length ? cells.join('') : filler(),
			'</tr>'
		);
	}
	return S(
		'<table cellpadding="0" cellspacing="0" style="width:100%; vertical-align:middle;">',
			row( cells.slice( 0, 5 ) ),
			row( cells.slice( 5 ) ),
		'</table>'
	);
}

	function formatTopbar() {
		return S(
			'<div id="topbar-content" style="position:relative;">',
				'<div style="margin:0; padding:3px; float:right;">',
					//'<a class="button', params.year == 2007 ? ' selected' : '', '" id="btn2007">',
					//	2007,
					//'</a>',
					//'&nbsp;',
					//'<a class="button', params.year == 2012 ? ' selected' : '', '" id="btn2012">',
					//	2012,
					//'</a>',
					//'&nbsp;&nbsp;&nbsp;&nbsp;',
					//'<a class="button', params.contest == 'pres' ? ' selected' : '', '" id="btnContest-pres">',
					//	'presidential'.T(),
					//'</a>',
					//'&nbsp;',
					//'<a class="button', params.contest == 'leg' ? ' selected' : '', '" id="btnContest-leg">',
					//	'legislative'.T(),
					//'</a>',
					//'&nbsp;&nbsp;&nbsp;&nbsp;',
					//'<a class="button', params.round == 1 ? ' selected' : '', '" id="btnRound1">',
					//	'round1'.T(),
					//'</a>',
					//'&nbsp;',
					//'<a class="button',
					//			params.round == 2 ? ' selected' : '', '" id="btnRound2">',
					//	'round2'.T(),
					//'</a>',
				'</div>',
				'<div style="clear:both;">',
				'</div>',
			'</div>'
		);
	}
	
function nationalEnabled() {
	return ! current.national;
}

(function( $ ) {
	
	// TODO: Refactor and use this exponential retry logic
	//function getJSON( type, path, file, cache, callback, retries ) {
	//	var stamp = now();
	//	if( ! opt.nocache ) stamp = Math.floor( stamp / cache / 1000 );
	//	if( retries ) stamp += '-' + retries;
	//	if( retries == 3 ) showError( type, file );
	//	_IG_FetchContent( path + file + '?' + stamp, function( json ) {
	//		// Q&D test for bad JSON
	//		if( json && json.charAt(0) == '{' ) {
	//			$('#error').hide();
	//			callback( eval( '(' + json + ')' ) );
	//		}
	//		else {
	//			reportError( type, file );
	//			retries = ( retries || 0 );
	//			var delay = Math.min( Math.pow( 2, retries ), 128 ) * 1000;
	//			setTimeout( function() {
	//				getJSON( type, path, file, cache, callback, retries + 1 );
	//			}, delay );
	//		}
	//	}, {
	//		refreshInterval: opt.nocache ? 1 : cache
	//	});
	//}
	
	var geoJSON = {};
	function loadRegion( geoid ) {
		var level =
			params.level != null ? params.level :
			geoid == 'BR' ? '' : '';
		geoid = geoid || current.geoid;
		var json = geoJSON[geoid];
		if( json ) {
			loadGeoJSON( json, true );
		}
		else {
			var file = S( 'br-', geoid, '-geom', level, '.js' );
			getGeoJSON( 'shapes/json/' + file );
		}
	}
	
	function getScript( url ) {
		$.ajax({
			url: url,
			dataType: 'script',
			cache: true
		});
	}
	
	function getGeoJSON( url ) {
		clearInterval( reloadTimer );
		reloadTimer = null;
		$('#spinner').show();
		getScript( cacheUrl( url ) );
	}
	
	var didLoadGeoJSON;
	loadGeoJSON = function( json ) {
		function oneTime() {
			if( ! didLoadGeoJSON ) {
				didLoadGeoJSON = true;
				$('#outer').html( contentTable() );
				initSelectors();
			}
		}
		var geoid = ( json.muni || json.state ).id;
		current.national = ( geoid == 'BR' );
		current.geoid = geoid;
		if( ! geoJSON[geoid] ) {
			geoJSON[geoid] = json;
			for( var kind in json ) {
				var geo = json[kind];
				indexFeatures( geo );
			}
			var tweak = tweakGeoJSON[geoid];
			tweak && tweak( json, geoid );
			oneTime();
		}
		//setCounties( true );
		getResults();
		//analytics( 'data', 'counties' );
	};
	
	function indexFeatures( geo ) {
		var features = geo.features;
		var by = features.by = {};
		for( var feature, i = -1;  feature = features[++i]; ) {
			feature.fid = featureId(feature);
			by[feature.id] = feature;
			by[feature.fid] = feature;
		}
	}
	
	var tweakGeoJSON = {
		BR: function( json, geoid ) {
			//var features = geoJSON.FR.departement.features;
			//features.by['986'].click = false;  // Wallis et Futuna
			//features.by['987'].click = false;  // French Polynesia
			//addLivingAbroad( features );
		}
	}
	
	function addLivingAbroad( features ) {
		var radius = 100000;
		var feature = {
			bbox: [ -radius, -radius, radius, radius ],
			centroid: [ 0, 0 ],
			click: false,
			draw: false,
			geometry: {
				coordinates: drawCircle( radius, 32 ),
				type: 'Polygon'
			},
			id: '099',
			name: "Fran&ccedil;ais de l'Etranger",
			type: 'Feature'
		};
		features.push( feature );
		features.by['099'] = feature;
	}
	
	function drawCircle( radius, steps ) {
		var ring = [];
		var pi2 = Math.PI * 2;
		for( var i = 0;  i < steps;  ++i ) {
			ring.push([
				radius * Math.sin( i / steps * pi2 ),
				radius * Math.cos( i / steps * pi2 )
			]);
		}
		ring.push( ring[0] );
		return [ ring ];
	}
	
	// TODO: refactor with addLivingAbroad()
	function addLivingAbroadLegislative( features ) {
		var radius = 100000;
		for( var district = 1;  district <= 11;  ++district ) {
			var id = S( '099', district < 10 ? '0' : '', district );
			var feature = {
				bbox: [ -radius, -radius, radius, radius ],
				centroid: [ 0, 0 ],
				click: false,
				draw: false,
				geometry: {
					coordinates: drawWedge( radius, 33, ( district - 1 ) * 3, 3 ),
					type: 'Polygon'
				},
				id: id,
				name: 'districtNum'.T({
					name: "Fran&ccedil;ais de l'Etranger",
					ordinal: ordinal(district)
				}),
				type: 'Feature'
			};
			features.push( feature );
			features.by[id] = feature;
		}
	}
	
	function drawWedge( radius, steps, start, count ) {
		var ring = [];
		var pi2 = Math.PI * 2;
		ring.push([ 0, 0 ]);
		for( var i = start;  i <= start + count;  ++i ) {
			ring.push([
				radius * Math.sin( i / steps * pi2 ),
				radius * Math.cos( i / steps * pi2 )
			]);
		}
		ring.push( ring[0] );
		return [ ring ];
	}
	
	function setPlayback() {
		var play = getPlaybackParams();
		if( ! play ) return;
		play.player.setup();
		setInterval( play.player.tick, play.time );
	}
	
	function getPlaybackParams() {
		var play = params.play;
		if( ! play ) return false;
		play = play.split( ',' );
		var time = Math.max( play[1] || 5000, 1000 );
		var type = play[0];
		var player = players[type];
		if( ! player ) return false;
		return {
			player: player,
			type: type,
			time: time
		};
	}
	
	function playType() {
		var play = getPlaybackParams();
		return play && play.type;
	}
	
	function playCandidates() {
		return playType() == 'candidates';
	}
	
	function playCounties() {
		return playType() == 'counties';
	}
	
	function autoplay() {
		return !! playType();
	}
	
	function interactive() {
		return ! autoplay();
	}
	
	function tv() {
		return autoplay();
	}
	
	function web() {
		return ! tv();
	}
	
	var players = {
		candidates: {
			setup: function() {
			},
			tick: function() {
				var topCandidates = getTopCandidates( state.results, -1, 'votes' );
				if( ! current.party ) {
					i = 0;
				}
				else {
					for( var i = 0;  i < topCandidates.length;  ++i ) {
						if( topCandidates[i].id == current.party ) {
							++i;
							if( i >= topCandidates.length )
								i = -1;
							break;
						}
					}
				}
				current.party = ( i >= 0  &&  topCandidates[i].id );
				setCandidate( current.party );
			}
		},
		counties: {
			//setup: function() {
			//	var features = state.geo.county.features;
			//	//features.playOrder = sortArrayBy( features, function( feature ) {
			//	//	return(
			//	//		-feature.centroid[1] * 1000000000 + feature.centroid[0]
			//	//	);
			//	//});
			//	features.playOrder = sortArrayBy( features, 'name' );
			//},
			//tick: function() {
			//	var geo = state.geo.county;
			//	var order = geo.features.playOrder,
			//		next = order.next, length = order.length;
			//	if( ! next  ||  next >= length ) next = 0;
			//	while( next < length ) {
			//		var feature = order[next++], id = feature.id;
			//		var row = featureResults( results, feature );
			//		var use = row && row[col.NumCountedBallotBoxes];
			//		if( use ) {
			//			outlineFeature({ geo:geo, feature:feature });
			//			showTip({ geo:geo, feature:feature });
			//			break;
			//		}
			//	}
			//	order.next = next;
			//}
		}
	};
	
	function showError( type, file ) {
		file = file.replace( '.json', '' ).replace( '-all', '' ).toUpperCase();
		$('#error').html( S( '<div>Error loading ', type, ' for ', file, '</div>' ) ).show();
		$('#spinner').hide();
	}
	
	function reportError( type, file ) {
		analytics( 'error', type, file );
	}
	
	function analytics( category, action, label, value, noninteraction ) {
		//analytics.seen = analytics.seen || {};
		//if( analytics.seen[path] ) return;
		//analytics.seen[path] = true;
		_gaq.push([ '_trackEvent',
			category, action, label, value, noninteraction
		]);
	}
	
	$body.addClass( autoplay() ? 'autoplay' : 'interactive' );
	$body.addClass( tv() ? 'tv' : 'web' );
	// TODO: refactor with duplicate code in geoReady() and resizeViewNow()
	var mapWidth = ww - sidebarWidth;
	$body
		.toggleClass( 'hidelogo', mapWidth < 340 )
		.toggleClass( 'narrow', ww < 770 );

	var map;
	
	var overlays = [];
	overlays.clear = function() {
		while( overlays.length ) overlays.pop().setMap( null );
	};
	
	//var state = states[opt.state];
	
	var reloadTimer;
	
	var geoMoveNext = true;
	var polyTimeNext = 250;
	
	var didGeoReady;
	function geoReady() {
		// TODO: refactor with duplicate code in resizeViewNow()
		setLegend();
		resizeViewOnly();
		colorize();
		if( geoMoveNext ) {
			geoMoveNext = false;
			moveToGeo();
		}
		else {
			polys();
		}
		//$('#view-usa').toggle( state.fips != '00' );
		$('#spinner').hide();
		if( ! opt.randomized  &&  opt.reloadTime  &&  params.refresh != 'false' ) {
			clearInterval( reloadTimer );
			reloadTimer = setInterval( function() {
				loadView();
			}, opt.reloadTime );
		}
		if( ! didGeoReady ) {
			setPlayback();
			didGeoReady = true;
		}
	}
	
	function currentGeo() {
		return currentGeos()[0];
	}
	
	function currentGeos() {
		var json = geoJSON[current.geoid];
		var jsonBR = geoJSON.BR;
		jsonBR.state.draw = ! json.muni;
		return json.muni ?
				[ json.muni, json.state, jsonBR.state ] :
				[ json.state, json.nation ];
	}
	
	function moveToGeo() {
		var json = geoJSON[current.geoid];
		if( ! json ) return;
		$('#map').show();
		initMap();
		gme && map && gme.trigger( map, 'resize' );
		//overlays.clear();
		//$('script[title=jsonresult]').remove();
		//if( json.status == 'later' ) return;
		
		outlineFeature( null );
		
		var bboxFR = {
			bbox: [ -1060000, 5060000, 1070000, 6650000 ]
		};
		
		var geo = {
			//'FR': bboxFR,
			//'FRL': bboxFR,
			//'988': {
			//	bbox: [ 18205000, -2600000, 18720000, -2215000 ]
			//},
			_: 0
		}[current.geoid] || json.state;
		geo && fitBbox( geo.bbox );
	}
	
	var setCenter = 'setCenter';
	function fitBbox( bbox ) {
		addBboxOverlay( bbox );
		var z;
		if( params.zoom  &&  params.zoom != 'auto' ) {
			z = +params.zoom;
		}
		else {
			if( ! bbox ) return;
			z = PolyGonzo.Mercator.fitBbox( bbox, {
				width: $('#map').width(),
				height: $('#map').height()
			});
		}
		z = Math.floor( z );
		
		// Force a poly draw if the map is not going to move (much)
		// TODO: better calculation using pixel position
		var centerLL = PolyGonzo.Mercator.coordToLngLat([
			( bbox[0] + bbox[2] ) / 2,
			( bbox[1] + bbox[3] ) / 2,
		]);
		var centerNew = new gm.LatLng( centerLL[1], centerLL[0] );
		function near( a, b ) { return Math.abs( a - b ) < .001; }
		var centerMap = map.getCenter();
		if( centerMap  &&  z == map.getZoom() ) {
			if(
				near( centerMap.lat(), centerLL[1] )  &&
				near( centerMap.lng(), centerLL[0] )
			) {
				polys();
			}
		}
		map.setZoom( z );
		map[setCenter]( centerNew );
		setCenter = 'panTo';
		zoom = map.getZoom();
	}
	
	//function shrinkBbox( bbox, amount ) {
	//	var dx = ( bbox[2] - bbox[0] ) * amount / 2;
	//	var dy = ( bbox[3] - bbox[1] ) * amount / 2;
	//	return [
	//		bbox[0] + dx,
	//		bbox[1] + dy,
	//		bbox[2] - dx,
	//		bbox[3] - dy
	//	];
	//}
	
	var bboxOverlay;
	function addBboxOverlay( bbox ) {
		if( ! params.bbox ) return;
		if( bboxOverlay )
			bboxOverlay.setMap( null );
		bboxOverlay = null;
		var geo = makeBboxGeo( bbox, {
			fillColor: '#000000',
			fillOpacity: 0,
			strokeWidth: 1,
			strokeColor: '#FF0000',
			strokeOpacity: .5
		});
		bboxOverlay = new PolyGonzo.PgOverlay({
			map: map,
			geos: [ geo ]
		});
		bboxOverlay.setMap( map );
	}
	
	function makeBboxGeo( bbox, settings ) {
		var feature = $.extend( {}, {
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[ bbox[0], bbox[1] ],
						[ bbox[0], bbox[3] ],
						[ bbox[2], bbox[3] ],
						[ bbox[2], bbox[1] ],
						[ bbox[0], bbox[1] ]
					]
				]
			}
		}, settings );
		return {
			crs: {
				type: 'name',
				properties: {
					name: 'urn:ogc:def:crs:EPSG::3857'
				}
			},
			features: [ feature ]
		}
	}
	
	var  mouseFeature;
	
	var dragged = false;
	function addMapListeners( map ) {
		gme.addListener( map, 'dragstart', function() {
			dragged = true;
		});
		gme.addListener( map, 'idle', function() {
			polys();
		});
/*
		nationalEnabled() && gme.addListener( map, 'zoom_changed', function() {
			var zoom = map.getZoom();
			if( zoom <= 4  &&  ! current.national )
				gotoGeo( '00', 'zoom' );
		});
*/
	}
	
	function maybeGo( where, feature, why ) {
		if(
			where.geo.id == 'BR'  &&
			feature.id != current.geoid  &&
			feature.click !== false
		) {
			gotoGeo( feature, why );
		}
	}
	
	var touch;
	if( params.touch ) touch = { mouse: true };
	var polysThrottle = throttle(200), showTipThrottle = throttle(200);
	
	var mousedown = false;
	var polyEvents = {
		mousedown: function( event, where ) {
			if( touch  &&  ! touch.mouse ) return;
			showTip( false );
			mousedown = true;
			dragged = false;
		},
		mouseup: function( event, where ) {
			if( touch  &&  ! touch.mouse ) return;
			mousedown = false;
		},
		mousemove: function( event, where ) {
			if( touch || mousedown ) return;
			polysThrottle( function() {
				var feature = where && where.feature;
				if( feature == mouseFeature ) return;
				mouseFeature = feature;
				if( feature && feature.id == current.geoid )
					where = feature = null;
				var cursor =
					! feature ? null :
					where.geo.id == 'BR'  &&  feature.click !== false ? 'pointer' :
					'default';
				map.setOptions({ draggableCursor: cursor });
				outlineFeature( where );
				showTipThrottle( function() { showTip(where); });
			});
		},
		touchstart: function( event, where ) {
			touch = {};
			if( event.touches.length == 1 )
				touch.where = where;
			else  // multitouch
				this.touchcancel( event, where );
		},
		touchmove: function( event, where ) {
			this.touchcancel( event, where );
		},
		touchend: function( event, where ) {
			var feature = touch.where && touch.where.feature;
			if( feature != mouseFeature ) {
				mouseFeature = feature;
				outlineFeature( touch.where );
				showTip( touch.where );
				touch.moveTip = true;
			}
			else {
				maybeGo( where, feature, 'tap' );
			}
		},
		touchcancel: function( event, where ) {
			delete touch.where;
			outlineFeature( null );
			showTip( false );
		},
		click: function( event, where ) {
			if( touch  &&  ! touch.mouse ) return;
			event.stopPropagation();
			mousedown = false;
			var didDrag = dragged;
			dragged = false;
			polyEvents.mousemove( event, where );
			if( didDrag ) return;
			var feature = where && where.feature;
			if( ! feature ) return;
			if( touch && touch.mouse ) {
				touch.where = where;
				this.touchend( event, where );
			}
			else {
				maybeGo( where, feature, 'click' );
			}
		}
	};
	
	function draw() {
		var geos = currentGeos();
		if( useInset() )
			geos.unshift( insetGeo() );
		var overlay = new PolyGonzo.PgOverlay({
			map: map,
			geos: geos,
			underlay: getInsetUnderlay,
			events: playType() ? {} : polyEvents
		});
		overlay.setMap( map );
		setTimeout( function() {
			overlays.clear();
			overlays.push( overlay );
		}, 1 );
		//overlay.redraw( null, true );
	}
	
	function polys() {
		outlineFeature( null );
		//overlays.clear();
		// Let map display before drawing polys
		//var pt = polyTimeNext;
		//polyTimeNext = 0;
		//if( pt )
		//	setTimeout( draw, 250 );
		//else
			draw();
	}
	
	function colorize() {
		var json = geoJSON[current.geoid];
		if( json.muni ) {
			colorVotes( json.muni, '#666666', 1, 1 );
			colorSimple( json.state, '#FFFFFF', '#444444', 1, 2 );
		}
		else {
			colorVotes( json.state, '#666666', 1, 1 );
			colorSimple( json.nation, '#FFFFFF', '#222222', 1, 2 );
		}
	}
	
	function colorSimple( geo, fillColor, strokeColor, strokeOpacity, strokeWidth ) {
		if( ! geo ) return;
		var features = geo.features;
		for( var iFeature = -1, feature;  feature = features[++iFeature]; ) {
			feature.fillColor = fillColor;
			feature.fillOpacity = 0;
			feature.strokeColor = strokeColor;
			feature.strokeOpacity = strokeOpacity;
			feature.strokeWidth = strokeWidth;
		}
	}
	
	function colorVotes( geo, strokeColor, strokeOpacity, strokeWidth ) {
		if( ! geo ) return;
		var features = geo.features;
		var time = now() + times.offset;
		var results = geoResults();
		var cols = results && results.cols, col = results && results.colsById;
		var parties = election.parties;
		if( !( parties && current.party ) ) {
			// Multiple party view
			for( var iFeature = -1, feature;  feature = features[++iFeature]; ) {
				var row = featureResults( results, feature );
				if( row  &&  row.candidateMax >= 0 ) {
					var candidate = row.candidates[row.candidateMax];
					feature.fillColor = candidate.party.color;
					feature.fillOpacity = .6;
				} else {
					feature.fillColor = '#FFFFFF';
					feature.fillOpacity = 0;
				}
				//var complete = row &&
				//	row[col.NumCountedBallotBoxes] ==
				//	row[col.NumBallotBoxes];
				feature.strokeColor = strokeColor;
				feature.strokeOpacity = strokeOpacity;
				feature.strokeWidth = strokeWidth;
			}
		}
		else {
			// Single party heatmap
			var rows = results.rows;
			var minFract = Infinity, maxFract = 0;
			var partyID = current.party, party = parties.by.id[partyID],
				color = party.color;
			var colParty = col['TabCount-' + partyID];
			var colTotal = col['TabTotal'];
			for( var iFeature = -1, feature;  feature = features[++iFeature]; ) {
				var row = featureResults( results, feature );
				var total = 0, value = 0;
				if( row ) {
					total = row[colTotal];
					value = row[colParty];
					var fract = total ? value / total : 0
					if( fract ) {
						minFract = Math.min( minFract, fract );
						maxFract = Math.max( maxFract, fract );
						row.fract = fract;
					}
				}
			}
			var fractRange = maxFract - minFract;
			for( var iFeature = -1, feature;  feature = features[++iFeature]; ) {
				var row = featureResults( results, feature );
				feature.fillColor = party.color;
				feature.fillOpacity =
					! row  ||  row.fract == 0 ?
						0 :
					fractRange > 0 ?
						( row.fract - minFract ) / fractRange * .75 :
						.75;
				//var complete = row &&
				//	row[col.NumCountedBallotBoxes] ==
				//	row[col.NumBallotBoxes];
				feature.strokeColor = strokeColor;
				feature.strokeOpacity = strokeOpacity;
				feature.strokeWidth = strokeWidth;
			}
		}
	}
	
	function useInset() {
		return false;
		if( ! current.national ) return false;
		var zoom = map.getZoom();
		return zoom >= 3  &&  zoom <= 6;
	}
	
	function getInsetUnderlay() {
		return null;
		if( ! current.national ) return null;
		var zoom = map.getZoom();
		var extra = zoom - 5;
		var pow = Math.pow( 2, extra );
		var size = 50 * pow;
		function clear( feature ) {
			delete feature.zoom;
			delete feature.offset;
		}
		function set( feature, z, x, y, centroidFeature ) {
			var centroid = ( centroidFeature || feature ).centroid;
			var p = PolyGonzo.Mercator.coordToPixel( centroid, z );
			feature.zoom = z + extra;
			feature.offset = { x: ( x - p[0] ) * pow, y: ( y - p[1] ) * pow };
		}
		function insetAll( action ) {
			function inset( id, z, x, y ) {
				var feature = featuresDept[id];
				if( feature ) {
					action( feature, z, x, y );
					var featureRgn = featuresRgn[ '0' + feature.code_reg ];
					if( featureRgn )
						action( featureRgn, z, x, y, feature );
				}
				if( featuresLeg ) {
					for(
						var featureLeg, i = 1;
						featureLeg = featuresLeg[S( id, i < 10 ? '0' : '', i )];
						++i
					) {
						action( featureLeg, z, x, y, feature );
					}
				}
			}
			inset( 971, 6.1, -200, -1325 );  // Guadeloupe
			inset( 972, 6.2, -200, -1275 );  // Martinique
			inset( 973, 3.3, -200, -1225 );  // Guyane
			inset( 974, 5.8, -200, -1175 );  // La Reunion
			inset( 975, 6.8, -200, -1125 );  // Saint Pierre et Miquelon
			inset( 976, 7.2, -150, -1325 );  // Mayotte
			inset( 988, 3.6, -150, -1275 );  // Nouvelle Caledoni
			inset( 987, 6.2, -150, -1225 );  // Polynesie Francais
			inset( 986, 7.5, -150, -1175 );  // Wallis-et-Futuna
			inset( '099', 4.8, -150, -1125 );  // Francais de l'Etranger
			
			// Wallis-et-Futuna
			function fixWeF( feature, centroidFeature ) {
				feature.geometry.coordinates.forEach( function( poly ) {
					poly.centroid = ( centroidFeature || feature ).centroid;  // hack
					var ring = poly[0];
					var coord = ring[0];
					if( coord[0] < -19700000 )
						action( poly, 7.5, -30, -1235, feature );
					else
						action( poly, 7.5, -257, -1117, feature );
				});
			}
			featureDept = featuresDept[986];
			fixWeF( featureDept );
			if( featuresLeg ) {
				for( var featureLeg, i = 1;  featureLeg = featuresLeg[ '9860' + i ];  ++i ) {
					fixWeF( featureLeg, featureDept );
				}
			}
			
			// Francais de l'Etranger (French living abroad)
			geo.departement.features.by['099'].draw = ( action == set );
		}
		var geo = geoJSON[current.geoid];
		if( ! geo ) return null;
		var featuresLeg = geo.legislative && geo.legislative.features.by;
		var featuresDept = geo.departement.features.by;
		var featuresRgn = geo.region.features.by;
		if( ! useInset() ) {
			insetAll( clear );
			return null;
		}
		insetAll( set );
		var images = [{
			//src: imgUrl('insets-fr.png'),
			width: size * 2, height: size * 5,
			left: -225 * pow, top: -1350 * pow
		}];
		return {
			images: images,
			hittest: function( image, x, y ) {
				var i = Math.floor( x / size );
				var j = Math.floor( y / size );
				var ids = [
					[ 971, 972, 973, 974, 975 ],
					[ 976, 988, 987, 986, '099' ]
				];
				var id = ids[i][j], feature = featuresDept[id];
				if( feature ) {
					return {
						geo: geo.departement,
						feature: feature
					}
				}
/*
				if( image.abbr )
					return {
						geo: geo.departement,
						feature: features.by[image.abbr]
					}
				var feature =
					x < 81 ? features.by.AK || features.by['02'] :
					view != 'county' ? features.by.HI :
					hittestBboxes( features, bboxesInsetHI, x, y );
				if( feature )
					return { geo: stateUS.geo, feature: feature }
*/

				return null;
			}
		};
	}
	
	function insetGeo() {
		var bbox = [ -1072000, 5350000, -600000, 6630000 ];
		var geo = makeBboxGeo( bbox, {
			fillColor: '#F8F8F8',
			fillOpacity: 1,
			strokeWidth: 1.5,
			strokeColor: '#222222',
			strokeOpacity: 1
		});
		geo.hittest = false;
		geo.click = false;
		return geo;
	}
	
	function hittestBboxes( features, places, x, y ) {
		for( var place, i = -1;  place = places[++i]; ) {
			var b = place.bbox;
			if( x >= b[0]  &&  x < b[2]  &&  y >= b[1]  &&  y < b[3] )
				return features.by[place.id];
		}
		return null;
	}
	
	var bboxesInsetHI = [
		{ id: '15001', bbox: [ 138,44, 163,67 ] },  // Hawaii
		{ id: '15003', bbox: [ 112,21, 129,47 ] },  // Honolulu
		{ id: '15007', bbox: [ 90,15, 112,42 ] },  // Kauai
		{ id: '15009', bbox: [ 129,29, 151,54 ] }  // Maui
	];
	
	// TODO: refactor this into PolyGonzo
	var outlineOverlay;
	function outlineFeature( where ) {
		if( outlineOverlay )
			outlineOverlay.setMap( null );
		outlineOverlay = null;
		if( !( where && where.feature ) ) return;
		var feat = where.feature;
		var faint = ( where.geo.draw === false );
		feat = $.extend( {}, feat, {
			fillColor: '#000000',
			fillOpacity: 0,
			strokeWidth: playCounties() ? 5 : opt.counties ? 1.5 : 2.5,
			strokeColor: '#000000',
			strokeOpacity: faint ? .25 : 1
		});
		outlineOverlay = new PolyGonzo.PgOverlay({
			map: map,
			geos: [{
				crs: where.geo.crs,
				kind: where.geo.kind,
				features: [ feat ]
			}]
		});
		outlineOverlay.setMap( map );
	}
	
	function getSeats( race, seat ) {
		if( ! race ) return null;
		if( seat == 'One' ) seat = '1';
		if( race[seat] ) return [ race[seat] ];
		if( race['NV'] ) return [ race['NV'] ];
		if( race['2006'] && race['2008'] ) return [ race['2006'], race['2008'] ];
		return null;
	}
	
	var tipOffset = { x:10, y:20 };
	var $maptip = $('#maptip'), tipHtml;
	if( ! playType() ) {
		$body.bind( 'click mousemove', moveTip );
		$maptip.click( function( event ) {
			if( event.target.id == 'close-tip' ) {
				showTip( false );
				event.preventDefault();
			}
			else if( current.national ) {
				// Only touch devices for now
				var feature = touch && touch.where && touch.where.feature;
				if( feature ) gotoGeo( feature, 'tap' );
			}
		});
	}
	
	function showTip( where ) {
		tipHtml = formatTip( where );
		if( tipHtml ) {
			$maptip.html( tipHtml ).show();
		}
		else {
			$maptip.hide();
			if( !( touch && touch.mouse ) )
				mouseFeature = null;
		}
	}
	
	function formatCandidateAreaPatch( candidate, max ) {
		var size = Math.round( Math.sqrt( candidate.vsTop ) * max );
		var margin1 = Math.floor( ( max - size ) / 2 );
		var margin2 = max - size - margin1;
		return S(
			'<div style="margin:', margin1, 'px ', margin2, 'px ', margin2, 'px ', margin1, 'px;">',
				formatDivColorPatch( candidate.party.color, size, size ),
			'</div>'
		);
	}
	
	function formatDivColorPatch( color, width, height, border ) {
		border = border || '1px solid #C2C2C2';
		return S(
			'<div style="background:', color, '; width:', width, 'px; height:', height, 'px; border:', border, '">',
			'</div>'
		);
	}
	
	function formatSpanColorPatch( colors, spaces, border ) {
		if( ! colors.push ) colors = [ colors ];
		border = border || '1px solid #C2C2C2';
		return S(
			'<span class="legend-candidate-color" style="border:', border, '; zoom:1;">',
				colors.mapjoin( function( color ) {
					return S(
						'<span class="legend-candidate-color" style="background:', color, '; zoom:1;">',
							'&nbsp;'.repeat( spaces || 6 ),
						'</span>'
					);
				}),
			'</span>'
		);
	}
	
	function formatCandidateIcon( candidate, size ) {
		var border = 'transparent', photo = '';
		if( candidate.id ) {
			border = '#C2C2C2';
			photo = S(
				'background:url(',
					imgUrl( S( 'candidate-photos-fr-', params.year, '-', size, '.png' ) ),
				'); ',
				'background-position:-',
				election.candidates.by.id[candidate.id].index * size, 'px 0px; '
			);
		}
		return S(
			'<div style="', photo, ' width:', size, 'px; height:', size, 'px; border:1px solid ', border, ';">',
			'</div>'
		);
	}
	
	function totalReporting( results ) {
		var col = results.colsById;
		var rows = results.rows;
		var counted = 0, total = 0;
		for( var row, i = -1;  row = rows[++i]; ) {
			if( row.wonRound1 ) continue;
			counted += row[col.NumCountedBallotBoxes];
			total += row[col.NumBallotBoxes];
		}
		return {
			counted: counted,
			total: total,
			percent: formatPercent( counted / total ),
			kind: ''  // TODO
		};
	}
	
	function getTopCandidates( results, row, sortBy, max, useSortKey ) {
		if( ! row ) return [];
		var pruneEmpty = true;
		var colIncr = current.national ? 2 : 4;
		var col = results.colsById;
		max = max || Infinity;
		if( row == -1 ) {
			// Use totals column.
			colIncr = 2;
			useSortKey = true;
			pruneEmpty = false;
			row = results.totals.row;
			col = results.totals.colsById;
		}
		if (!row.candidates) {
			return []
		}
		var top = row.candidates.slice();
		if (!row.total) {
			var total = 0;
			var totalValid = 0;
			for( var i = 0, iCol = 0;  i < top.length; ++i, iCol += colIncr ) {
				var candidate = top[i];
				var votes = row[iCol];
				candidate.votes = votes;
				if (useSortKey) {
					candidate.sortKey = candidate.party.sortKey;
				}
				total += votes;
				if (candidate.party.valid) {
					totalValid += votes;
				}
			}
			row.total = total;
		}
		var syntheticCandidates = [];
		for( var i = 0; i < top.length; ) {
			if ( useSortKey && top[i].party.synthetic ) {
				var removed = top.splice(i, 1);
				syntheticCandidates.push(removed[0]);
			} else if (pruneEmpty && !top[i].votes) {
				top.splice(i, 1);  // remove;
			} else {
				i++;
			}
		}
		if( top.length ) {
			var sorter = function(a, b) {
				var aKey = a.sortKey || a[sortBy];
				var bKey = b.sortKey || b[sortBy];
				return bKey - aKey;
			};
			top = top.sort(sorter).slice( 0, max );
			if (useSortKey) {
				top = top.concat(syntheticCandidates.sort(sorter));
			}
			var most = top[0].votes;
			top.total = 0;
			for( var i = -1;  ++i < top.length; ) {
				var candidate = top[i];
				top.total += candidate.votes;
				candidate.vsAll = candidate.votes / row.total;
				candidate.vsTop = candidate.votes / most;
			}
		}
		return top;
	}
	
	function setLegend() {
		makeCurrentCandidateValid();
		$('#topbar').html( formatTopbar() );
		$('#sidebar').html( formatSidebar() );
	}
	
	function makeCurrentCandidateValid() {
		if( ! current.party )
			return;
		var results = geoResults();
		var col = results.totals.colsById[ 'TabCount-' + current.party ];
		if( ! results.totals.row[col] )
			current.party = null;
	}
	
	function nameCase( name ) {
		return name && name.split(' ').map( function( word ) {
			return word.slice( 0, 1 ) + word.slice( 1 ).toLowerCase();
		}).join(' ');
	}
	
	function testFlag( results ) {
		return debug && results && ( results.mode == 'test'  ||  opt.randomized );
	}
	
	function viewNationalEnabled() {
		return ! current.national  &&  nationalEnabled();
	}
	
	function formatSidebar() {
		var resultsHeaderHTML = '';
		var resultsScrollingHTML = '';
		var geo = currentGeo();
		var results = geoResults();
		if( results ) {
			var topCandidates = getTopCandidates( results, -1, 'votes' );
			var none = ! topCandidates.length;
			var total = topCandidates.total;
			var top = none ? '' : formatSidebarTopCandidates( topCandidates.slice( 0, 4 ), topCandidates.total);
			var test = testFlag( results );
			var viewNational = nationalEnabled() ? S(
				'<a href="#" id="viewNational" title="', 'titleViewNational-br'.T(), '" style="">',
					'viewNational-br'.T(),
				'</a>'
			) : '&nbsp;';
			resultsHeaderHTML = S(
				'<div id="percent-reporting" class="body-text">',
					'percentReporting'.T( totalReporting(results) ),
				'</div>',
				'<div id="auto-update" class="subtitle-text" style="margin-bottom:8px; ',
					test ? 'color:red; font-weight:bold;' : '',
				'">',
					test ? 'testData'.T() : 'automaticUpdate'.T(),
				'</div>',
				'<div style="padding-bottom:3px;">',
					viewNational,
				'</div>'
			);
			var candidates = topCandidates.map( formatSidebarCandidate );
			resultsScrollingHTML = none ? '' : S(
				formatCandidateList(
					[ top ].concat( candidates ),
					function( candidate ) {
						return candidate;
					},
					false
				)
			);
		}
		//var linkHTML = !(
		//	params.usa ||
		//	params.hide_links ||
		//	params.embed_state
		//) ? S(
		//	'<a href="http://www.google.com/elections/ed/us/results/2012/gop-primary/',
		//			state.abbr.toLowerCase(),
		//			'" target="_parent" id="linkToMap" class="small-text" title="',
		//			'linkToMapTitle'.T(), '">',
		//		'linkToMap'.T(),
		//	'</a>'
		//) : '';
		return S(
			'<div id="sidebar">',
				'<div class="sidebar-header">',
					'<div id="election-title" class="title-text">',
						'br'.T(),
					'</div>',
					'<div id="election-date-row" class="" style="margin-bottom:8px; position:relative;">',
						'<div id="election-date" class="subtitle-text" style="float:left;">',
							longDateFromYMD( election.date ),
						'</div>',
						'<div id="map-link" class="small-text" style="float:right; padding-right:3px;">',
							//linkHTML,
						'</div>',
						'<div style="clear:both;">',
						'</div>',
					'</div>',
					'<div id="sidebar-results-header">',
						resultsHeaderHTML,
					'</div>',
				'</div>',
				'<div class="scroller" id="sidebar-scroll">',
					resultsScrollingHTML,
					'<div id="sidebar-attrib" class="faint-text" style="padding:4px 8px 0; border-top:1px solid #C2C2C2;">',
						'brSource'.T(),
					'</div>',
				'</div>',
			'</div>'
		);
	}
	
	function formatSidebarTopCandidates( topCandidates, total ) {
		var colors = topCandidates.map( function( candidate ) {
			return candidate.party.color;
		});
		var selected = current.party ? '' : ' selected';
		return S(
			'<tr class="legend-header">',
				'<td colspan="2" class="left">', 'party'.T(), '</td>',
				'<td class="right">', 'municipalities'.T(), '</td>',
			'</tr>',
			'<tr class="legend-candidate', selected, '" id="legend-candidate-top">',
				'<td class="left">',
					'<div class="legend-candidate">',
						formatSpanColorPatch( colors, 2 ),
					'</div>',
				'</td>',
				'<td>',
					'<div class="legend-candidate">',
						'allParties'.T(),
					'</div>',
				'</td>',
				'<td class="right">',
					'<div class="legend-candidate">',
						formatNumber(total),
					'</div>',
				'</td>',
			'</tr>'
		);
	}
	
	function formatSidebarCandidate( candidate ) {
		var candidateLabel = candidate.party.label;
		var selected = ( candidate.id == current.party ) ? ' selected' : '';
		return S(
			'<tr class="legend-candidate', selected, '" id="legend-candidate-', candidate.id, '">',
				'<td class="left">',
					'<div class="legend-candidate">',
						formatSpanColorPatch( candidate.party.color, 8 ),
					'</div>',
				'</td>',
				'<td>',
					'<div class="legend-candidate">',
						candidateLabel,
					'</div>',
				'</td>',
				// '<td>',
				// 	'<div class="legend-candidate" style="text-align:right;">',
				// 		formatPercent( candidate.vsAll ),
				// 	'</div>',
				// '</td>',
				'<td class="right">',
					'<div class="legend-candidate">',
						formatNumber( candidate.votes ),
					'</div>',
				'</td>',
			'</tr>'
		);
	}
	
	function formatCandidateList( topCandidates, formatter, header ) {
		if( ! topCandidates.length )
			return 'waitingForVotes'.T();
		var thead = header ? S(
			'<tr>',
				'<th colspan="3" style="text-align:left; padding-bottom:4px;">',
					header.title,
				'</th>',
				'<th style="text-align:right; padding-bottom:4px;">',
				'</th>',
				'<th style="text-align:right; padding-bottom:4px;">',
					header.value,
					//current.national  &&  view != 'county' ? 'delegatesAbbr'.T() : '',
				'</th>',
			'</tr>'
		) : '';
		var cls = current.national ? 'national' : 'state';
		return S(
			'<table class="candidates ', cls, '" cellpadding="0" cellspacing="0">',
				thead,
				topCandidates.mapjoin( formatter ),
			'</table>'
		);
	}
	
	function formatListCandidate( candidate, i) {
		var selected = ( candidate.id == current.party ) ? ' selected' : '';
		var cls = i === 0 ? 'first' : '';
		var pct = formatPercent( candidate.vsAll );
		var voteDivs = S(
			'<div class="candidate-percent">',
				pct,
			'</div>',
			web() ? S(
				'<div class="candidate-votes">',
					formatNumber( candidate.votes ),
				'</div>'
			) : ''
		)
		var candidateLabel;
		if (candidate.party.synthetic) {
			cls += ' synthetic';
			candidateLabel = candidate.party.label;
		} else if (candidate.name) {
			candidateLabel = candidate.name + ' (' + candidate.party.id + ')';
		} else {
			candidateLabel = candidate.party.label + ' (' + candidate.party.id + ')';
		}
		return S(
			'<tr class="legend-candidate ', cls, '" id="legend-candidate-', candidate.id, '">',
				'<td class="left">',
					election.photos ? S(
						'<div style="margin:6px 0;">',
							formatCandidateIcon( candidate, 32 ),
						'</div>'
					) : '',
				'</td>',
				'<td>',
					'<div class="candidate-name" style="',
								election.photos ? '' : 'margin-top:4px; margin-bottom:4px;',
							'">',
						'<div class="last-name" style="font-weight:bold;">',
							candidateLabel,
						'</div>',
					'</div>',
				'</td>',
				'<td style="text-align:center;">',
					formatCandidateAreaPatch( candidate, 24 ),
				'</td>',
				'<td style="text-align:right; padding-left:6px;">',
				'</td>',
				'<td class="right" style="text-align:right; padding-left:6px;">',
					voteDivs,
					//current.national  &&  view != 'county' ? S(
					//	'<div class="candidate-delegates">',
					//		candidate.delegates,
					//	'</div>'
					//) : '',
				'</td>',
			'</tr>'
		);
	}
	
	function ordinal( n ) {
		switch( params.hl ) {
			case 'br':
				var suffix = 'o';
			case 'fr':
				var suffix = ( n == 1 ? 're' : 'e' );
				break;
			default:
				var m = n > 20 ? n % 10 : n;
				var suffix = ( m == 1 ? 'st' : m == 2 ? 'nd' : m == 3 ? 'rd' : 'th' );
				break;
		}
		return n + suffix;
	}
	
	function formatFeatureName( feature ) {
		if( ! feature ) return '';
		return feature.name;
	}
	
	function mayHaveResults( row, col ) {
		return(
			row[col.TabTotal] > 0  ||
			row[col.NumCountedBallotBoxes] < row[col.NumBallotBoxes]
		);
	}
	
	function formatTip( where ) {
		var feature = where && where.feature;
		if( ! feature ) return null;
		var geo = where.geo;
		var geoid = feature.id;
		var future = false;
		var results = geoResults(geo), col = results && results.colsById;
		var row = geo.draw !== false  &&  featureResults( results, feature );
		var top = [];
		if( row  &&  col  &&  mayHaveResults(row,col) ) {
			row.geoid = geoid;
			row.geo = geo;
			top = getTopCandidates( results, row, 'votes', 4 , /* useSortKey */ true);
			if( row.wonRound1 ) top[0].wonRound1 = true;
			var heading = {
				title: current.national ? 'party'.T() : 'candidate'.T(),
				value: current.national ? 'municipalities'.T() : 'votes'.T()
			};
			var content = S(
				'<div class="tipcontent">',
					formatCandidateList( top, formatListCandidate, heading ),
				'</div>'
			);
			
			var boxes = row[col.NumBallotBoxes];
			var counted = row[col.NumCountedBallotBoxes];
			var pctInvalid = formatPercent( row[col.InvalidTotal] / row[col.TabTotal] );
		}
		
		var reporting =
			row && row.wonRound1 ? '' :
			boxes ? 'percentReporting'.T({
				percent: formatPercent( counted / boxes ),
				counted: counted,
				total: boxes,
				kind: ''
			}) :
			future ? longDateFromYMD(st.date) :
			geo.draw === false ? 'clickForLocal'.T() :
			'waitingForVotes'.T();
		
		var clickForLocal =
			top.length &&
			current.national ? S(
				'<div class="click-for-local faint-text">',
					( feature.click === false ? 'noLocal' : touch ? 'tapForLocal' : 'clickForLocal' ).T(),
				'</div>'
			) : '';
		// TODO
		var parent = null;  /* data.state.geo &&
			data.state.geo.features.by.id[feature.parent]; */
		
		var test = testFlag( results );
		
		var closebox = touch ? S(
			'<div style="position:absolute; right:6px; top:6px;">',
				'<a href="#">',
					'<img id="close-tip" border="0" style="width:24px; height:24px;" src="', imgUrl('close.png'), '" />',
				'</a>',
			'</div>'
		) : '';
		
		return S(
			'<div class="tiptitlebar">',
				'<div style="float:left;">',
					'<span class="tiptitletext">',
						formatFeatureName( feature ),
						//debug ? S(
						//	'<br>geo id: ', feature.id,
						//	'<br>ft id: ', row[col.ID]
						//) : '',
						' ',
					'</span>',
				'</div>',
				closebox,
				'<div style="clear:left;">',
				'</div>',
				parent ? ' ' + parent.name : '',
				parent && debug ? ' (#' + parent.id + ')' : '',
				'<div class="tipreporting">',
					reporting,
					test ? S(
						'<span style="color:red; font-weight:bold; font-size:100%;"> ',
							'testData'.T(),
						'</span>'
					) : '',
				'</div>',
			'</div>',
			content,
			clickForLocal
		);
	}
	
	function moveTip( event ) {
		if( ! tipHtml ) return;
		if( touch ) {
			if( ! touch.moveTip ) return;
			delete touch.moveTip;
		}
		var x = event.pageX, y = event.pageY;
		if(
			x < mapPixBounds.left  ||
			x >= mapPixBounds.right  ||
			y < mapPixBounds.top  ||
			y >= mapPixBounds.bottom
		) {
			showTip( false );
		}
		x += tipOffset.x;
		y += tipOffset.y;
		var pad = 2;
		var width = $maptip.width(), height = $maptip.height();
		var offsetLeft = width + tipOffset.x * 2;
		var offsetTop = height + tipOffset.y * 2;
		
		if( x + width > ww - pad ) {
			x -= width + pad + tipOffset.x * 2;
		}
		if( x < pad ) {
			x = pad;
		}
		
		if( y + height > wh - pad )
			y -= height + pad + tipOffset.y * 2;
		if( y < pad )
			y = wh - pad - height - tipOffset.y * 2;
		
		$maptip.css({ left:x, top:y });
	}
	
	// TODO: rewrite this
	function formatNumber( nStr ) {
		var dsep = 'decimalSep'.T(), tsep = 'thousandsSep'.T();
		return formatMoney(parseInt(nStr), 0, tsep, dsep);
	}

// Taken from the webz.
function formatMoney( n, decPlaces, thouSeparator, decSeparator) {
	decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
	decSeparator = decSeparator == undefined ? "." : decSeparator,
	thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
	sign = n < 0 ? "-" : "",
	i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
	j = (j = i.length) > 3 ? j % 3 : 0;
	return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
}
	
	function formatPercent( n ) {
		return percent1( n, 'decimalSep'.T() );
	}
	
	function getLeaders( locals ) {
		var leaders = {};
		for( var localname in locals ) {
			var votes = locals[localname].votes[0];
			if( votes ) leaders[votes.name] = true;
		}
		return leaders;
	}
	
	// Separate for speed
	function getLeadersN( locals, n ) {
		var leaders = {};
		for( var localname in locals ) {
			for( var i = 0;  i < n;  ++i ) {
				var votes = locals[localname].votes[i];
				if( votes ) leaders[votes.name] = true;
			}
		}
		return leaders;
	}
	
	function gotoGeo( id, why ) {
		if( typeof id != 'string' ) id = id && id.id;
		if( ! id ) return;
		stopCycle();
		//var select = $('#stateSelector')[0];
		//select && ( select.selectedIndex = state.selectorIndex );
		//opt.state = state.abbr.toLowerCase();
		outlineFeature( null );
		geoMoveNext = true;
		loadViewID( id );
		if( why ) analytics( why, 'geo', id );
	}
	
	var mapStyles = [
		{
			stylers: [ { saturation: -25 } ]
		},{
			featureType: "road",
			elementType: "labels",
			stylers: [ { visibility: "off" } ]
		},{
			featureType: "road",
			elementType: "geometry",
			stylers: [ { lightness: 50 }, { saturation: 10 }, { visibility: "simplified" } ]
		},{
			featureType: "transit",
			stylers: [ { visibility: "off" } ]
		},{
			featureType: "landscape",
			stylers: [ { lightness: 100 }, { saturation: -100 } ]
		},{
			featureType: "administrative",
			elementType: "geometry",
			stylers: [ { visibility: "off" } ]
		},{
			featureType: "administrative.country",
			elementType: "labels",
			stylers: [ { visibility: "off" } ]
		//},{
		//	featureType: "administrative",
		//	stylers: [ { visibility: "off" } ]
		//},{
		//	featureType: "administrative.locality",
		//	stylers: [ { visibility: "on" } ]
		},{
			featureType: "poi.attraction",
			elementType: "all",
			stylers: [ { lightness: 60 }, { visibility: "simplified" } ]
		},{
			featureType: "poi.park",
			elementType: "all",
			stylers: [ { lightness: 60 }, { visibility: "simplified" } ]
		}
	];
	
	function initMap() {
		if( map ) return;
		gm = google.maps, gme = gm.event;
		mapPixBounds = $('#map').bounds();
		var mapopt = $.extend({
			mapTypeControl: false,
			mapTypeId: 'simple',
			streetViewControl: false,
			panControl: false,
			rotateControl: false
		},
		params.play ? {
			zoomControl: false
		} : {
			zoomControlOptions: {
				//position: gm.ControlPosition.TOP_RIGHT,
				style: gm.ZoomControlStyle.SMALL
			}
		});
		map = new gm.Map( $('#map')[0],  mapopt );
		var mapType = new gm.StyledMapType( mapStyles );
		map.mapTypes.set( 'simple', mapType );
		addMapListeners( map );
		
		//if( ! PolyGonzo.isVML() ) {
		//	gme.addListener( map, 'zoom_changed', function() {
		//		var oldZoom = zoom;
		//		zoom = map.getZoom();
		//		if( zoom > oldZoom  &&  zoom >= 7 )
		//			setCounties( true );
		//		else if( zoom < oldZoom  &&  zoom < 7 )
		//			setCounties( false );
		//	});
		//}
	}
	
	function initSelectors() {
		
		//gotoGeo( opt.state );
		
		//$('#stateSelector').bindSelector( 'change keyup', function() {
		//	var value = this.value.replace('!','').toLowerCase();
		//	if( opt.state == value ) return;
		//	opt.state = value;
		//	setCounties( value > 0 );
		//	var state = data.state.geo.features.by.id[value];
		//	fitBbox( state ? state.bbox : data.state.geo.bbox );
		//});
		
		$('#chkCounties').click( function() {
			setCounties( this.checked );
		});
		
		var $topbar = $('#topbar');
		var $sidebar = $('#sidebar');
		$sidebar.delegate( 'tr.legend-candidate', {
			mouseover: function( event ) {
				$(this).addClass( 'hover' );
			},
			mouseout: function( event ) {
				$(this).removeClass( 'hover' );
			},
			click: function( event ) {
				var id = this.id.replace(/^legend-candidate-/,'');
				if( id == 'top'  ||  id == current.party ) id = null;
				$('#chkCycle').prop({ checked:false });
				stopCycle();
				setCandidate( id, 'click' );
			}
		});
		
		$topbar.delegate( 'a', {
			mouseover: function( event ) {
				if( ! $(this).hasClass('disabled') )
					$(this).addClass( 'hover' );
			},
			mouseout: function( event ) {
				if( ! $(this).hasClass('disabled') )
					$(this).removeClass( 'hover' );
			}
		});
		
		$topbar.delegate( '#btn2007,#btn2012', {
			click: function( event ) {
				setYear( this.id.replace(/^btn/, '' ) );
				event.preventDefault();
			}
		});
		
		//$topbar.delegate( '#btnContest-pres,#btnContest-leg', {
		//	click: function( event ) {
		//		setContest( this.id.replace(/^btnContest-/, '' ) );
		//		event.preventDefault();
		//	}
		//});
		
		$topbar.delegate( '#btnRound1,#btnRound2', {
			click: function( event ) {
				if( ! $(this).hasClass('disabled') )
					setRound( this.id.replace(/^btnRound/, '' ) );
				event.preventDefault();
			}
		});
		
		$sidebar.delegate( '#viewNational', {
			click: function( event ) {
				gotoGeo( 'BR', 'return' );
				event.preventDefault();
			}
		});
		
		//$sidebar.delegate( '#btnCycle', {
		//	click: function( event ) {
		//		toggleCycle();
		//	}
		//});
		
		setCandidate = function( id, why ) {
			current.party = id;
			loadView();
			if( why ) analytics( why, 'candidate', id || 'all' );
		}
	}
	
	//function setRound( round ) {
	//	params.round = round;
	//	setElection();
	//	loadView();
	//}
	
	function setYear( year ) {
		params.year = year;
		setElection();
		loadView();
	}
	
	function toggleCycle() {
		if( opt.cycleTimer ) stopCycle();
		else startCycle();
	}
	
	var startCycleTime;
	function startCycle() {
		if( opt.cycleTimer ) return;
		startCycleTime = now();
		this.title = 'cycleStopTip'.T();
		var player = players.candidates;
		opt.cycleTimer = setInterval( player.tick, 3000 );
		player.tick();
		analytics( 'cycle', 'start' );
	}
	
	function stopCycle() {
		if( ! opt.cycleTimer ) return;
		clearInterval( opt.cycleTimer );
		opt.cycleTimer = null;
		$('#btnCycle')
			.removeClass( 'selected' )
			.prop({ title: 'cycleTip'.T() });
		var seconds = Math.round( ( now() - startCycleTime ) / 1000 );
		analytics( 'cycle', 'stop', '', seconds );
	}
	
	function hittest( latlng ) {
	}
	
	function loadView() {
		loadViewID( current.geoid );
	}
	
	function loadViewID( geoid ) {
		showTip( false );
		//overlays.clear();
		//opt.state = +$('#stateSelector').val();
		//var state = curState = data.state.geo.features.by.abbr[opt.abbr];
		$('#spinner').show();
		clearInterval( reloadTimer );
		reloadTimer = null;
		loadRegion( geoid );
	}
	
	var resizeOneshot = oneshot();
	function resizeView() {
		resizeOneshot( resizeViewNow, 250 );
	}
	
	function resizeViewOnly() {
		// TODO: refactor with duplicate code in geoReady()
		ww = $window.width();
		wh = $window.height();
		$body
			.css({ width: ww, height: wh })
			.toggleClass( 'hidelogo', mapWidth < 340 )
			.toggleClass( 'narrow', ww < 770 );
		
		$('#spinner').css({
			left: Math.floor( ww/2 - 64 ),
			top: Math.floor( wh/2 - 20 )
		});
		
		$('#topbar').css({
			position: 'absolute',
			left: sidebarWidth,
			top: 0,
			width: ww - sidebarWidth
		});
		var topbarHeight = $('#topbar').height() + 1;
		var mapLeft = sidebarWidth, mapTop = topbarHeight;
		var mapWidth = ww - mapLeft, mapHeight = wh - mapTop;
		var $sidebarScroll = $('#sidebar-scroll');
		$sidebarScroll.height( wh - $sidebarScroll.offset().top );
		
		mapPixBounds = $('#map')
			.css({
				position: 'absolute',
				left: mapLeft,
				top: mapTop,
				width: mapWidth,
				height: mapHeight
			})
			.bounds();
	}
	
	function resizeViewNow() {
		resizeViewOnly();
		moveToGeo();
	}
	
	//function getShapes( state, callback ) {
	//	if( state.shapes ) callback();
	//	else getJSON( 'shapes', opt.shapeUrl, state.abbr.toLowerCase() + '.json', 3600, function( shapes ) {
	//		state.shapes = shapes;
	//		//if( current.national ) shapes.features.state.index('state');
	//		callback();
	//	});
	//}
	
	function geoResults( geo ) {
		var results = ( geo || currentGeo() || {} ).results;
		return results && results[electionKey];
	}
	
	var cacheResults = new Cache;
	
	function getResults() {
		var electionid = election.electionids[current.geoid];
		
		//var results = cacheResults.get( electionid );
		//if( results ) {
		//	loadResultTable( results, false );
		//	return;
		//}
		
		if( params.zero ) delete params.randomize;
		if( params.randomize || params.zero ) {
			loadTestResults( electionid, params.randomize );
			if (params.loc && params.loc != current.geoid) {
				var loc = params.loc;
				delete params.loc;
				loadViewID(loc);
			}
			return;
		}
		
		getElections([ electionid ]);
	}
	
	var electionLoading, electionsPending = [];
	function getElections( electionids ) {
		electionLoading = electionids[0];
		electionsPending = [].concat( electionids );
		electionids.forEach( function( electionid ) {
			var url = S(
				'https://pollinglocation.googleapis.com/results?',
				'electionid=', electionid,
				'&_=', Math.floor( now() / opt.resultCacheTime )
			);
			getScript( url );
		});
	}

	function featureId(feature) {
		return feature.tsecod || feature.id;
	}
		
	
	function loadTestResults( electionid, randomize ) {
		var random = randomize ? randomInt : function() { return 0; };
		opt.resultCacheTime = Infinity;
		opt.reloadTime = false;
		clearInterval( reloadTimer );
		reloadTimer = null;
		//delete params.randomize;
		
		var nCandidates = 6;
		var colIncr = 4;
		var offSet = randomInt(5);
		var col = [];
		if ( current.national ) {
			nCandidates = election.parties.length;
			colIncr = 2;
			election.parties.forEach( function( party ) {
				col.push( 'TabCount-' + party.id );
			});
		} else {
			for (var i = 0; i < nCandidates + 2; i++) {
				col.push(
					'TabCount-' + i,
					'First Name-' + i,
					'Last Name-' + i,
					'Party ID-' + i
				);
			};
		}
		col = col.concat(
			'ID',
			'TabTotal',
			'NumBallotBoxes',
			'NumCountedBallotBoxes'
		);
		col.index();

		var validPartyCount = election.parties.length - 2;
		var partyOffset = randomInt(new Date().getSeconds()) % validPartyCount;
		var rows = currentGeo().features.map( function( feature ) {
			var row = [];
			var colID = col.ID;
			row[colID] = current.national ? feature.abbrstate.toLowerCase() : featureId(feature);
			var nPrecincts = row[col.NumBallotBoxes] = random( 50 ) + 5;
			var nCounted = row[col.NumCountedBallotBoxes] =
				params.randomize == '100' ? nPrecincts :
				Math.max( 0,
					Math.min( nPrecincts,
						random( nPrecincts * 2 ) -
						Math.floor( nPrecincts / 2 )
					)
				);
			var total = 0;
			var available = current.national ? currentGeo().features.length : 1000000 + randomInt(Math.abs(feature.centroid[0]));
			function pushCandidate(iCol, votes, name, partyID) {
				available -= votes
				total += row[iCol] = nCounted ? votes : 0;
				if ( ! current.national ) {
					row[iCol+1] = name;
					// last name empty.
					row[iCol+2] = '';
					row[iCol+3] = partyID;
				}
			}
			// first two parties are blank and null.
			pushCandidate(0, randomInt(available / 10),
				 election.parties.by.id[election.parties.blankID].label,
				 election.parties.blankID);
			pushCandidate(colIncr, randomInt(available / 10),
				 election.parties.by.id[election.parties.nullID].label,
				 election.parties.nullID, colIncr);
			for( var iCol = colIncr * 2;  iCol < colID; iCol += colIncr) {
				var votes = randomInt(available / 2);
				var partyID = election.parties[(partyOffset++ % validPartyCount) + 2].id;
				var candidateName = election.candidates.random().fullName;
				pushCandidate(iCol, votes, candidateName, partyID);
			}
			row[col.TabTotal] = total + random(total*2);
			return row;
		});
		
		var json = {
			electionid: electionid,
			mode: 'test',
			table: {
				cols: col,
				rows: rows
			}
		};
		
		loadResultTable( json, true );
	}
	
	handleJSONPError = function( json ) {
		//json = {
		//	"status": "REQUEST_FAILED",
		//	"error": {
		//		"code": 500,
		//		"debug_message": "Internal Server Error"
		//	}
		//};
		window.console && console.log( S(
			'JSON error: ', json.status, ' ',
			json.error && json.error.code, ' ', 
			json.error && json.error.debug_message
		) );
		// TODO: report to user? retry?
	};
	
	loadFilteredResults = function( json, electionid, geoid, mode ) {
		electionid += '&district=' + geoid;
		deleteFromArray( electionsPending, electionid );
		json.electionid = '' + electionid;
		json.mode = mode;
		loadResultTable( json, true );
	};
	
	loadResults = function( json, electionid, mode ) {
		deleteFromArray( electionsPending, electionid );
		json.electionid = '' + electionid;
		json.mode = mode;
		loadResultTable( json, true );
	};
	
	//var lsadPrefixes = {
	//	cd: 'district'.T() + ' ',
	//	shd: 'district'.T() + ' '
	//};
	
	//var lsadSuffixes = {
	//	city: ' ' + 'city'.T(),
	//	county: ' ' + 'county'.T()
	//};
	
	function featureResults( results, feature ) {
		if( !( results && feature ) ) return null;
		return results.rowsByID[feature.id];
	}
	
	var missingOK = {
		//US: { AS:1, GU:1, MP:1, PR:1, VI:1 }
	};
	
	function fixup( geoid, id, opt_features, opt_tablename ) {
		if( id === null )
			return null;
		if (opt_features) {
			if (current.national) {
				id = id.toUpperCase();
			}
			var feature = opt_features.by[id];
			if (feature) {
				return feature.id;
			}
			window.console.log('Did not find feature id [', id, '] in features: ', opt_features);
		}
		return id;
	}
	
	function loadResultTable( json, loading ) {
		if( loading )
			cacheResults.add( json.electionid, json, opt.resultCacheTime );
		
		var geo = currentGeo();  //  geoJSON[current.geoid];
		geo.results = geo.results || {};
		var results = geo.results[electionKey] = json.table;
		results.mode = json.mode;
		var zero = ( json.mode == 'test'  &&  ! debug );
		
		var col = results.colsById = {};
		col.candidates = 0;
		var cols = results.cols;
		for( var id, iCol = -1;  id = cols[++iCol]; ) {
			col[id] = iCol;
		}
		var colID = col.ID;
		
		var multiColumn = (geo.table == 'br.muni');
		var colIncr = multiColumn ? 4 : 2;
		
		var rowT = [], colsT = [], colT = {};
		rowT.candidates = [];
		var totals = results.totals = {
			row: rowT,
			cols: colsT,
			colsById: colT
		};
		function totalPush( colID, value, opt_party ) {
			colT[colID] = colsT.length;
			colsT.push( colID );
			rowT.push( value );
			if( opt_party ) {
				rowT.candidates.push({
					id: opt_party.id,
					party: opt_party,
					label: opt_party.label,
				});
			}
		}
		election.parties.forEach( function( party ) {
			totalPush( 'TabCount-' + party.id, 0, party );
		});
		totalPush( 'TabTotal', 0 );
		totalPush( 'NumBallotBoxes', 0 );
		totalPush( 'NumCountedBallotBoxes', 0 );
		totalPush( 'ValidTotal', 0 );
		totalPush( 'InvalidTotal', 0 );
		
		var features = geo.features;
		
		var rowsByID = results.rowsByID = {};
		var rows = results.rows;
		var geoid = geo.id;

		function extractPartyId(colTitle) {
			var l = 'TabCount-'.length;
			var id = current.national ? colTitle.substring(l, l+2) : colTitle.substring(l);
			if (!(id in election.parties.by)) {
				window.console.log('Test id ' + id);
				var party =  election.parties[(parseInt(id) % election.parties.length) + 1];
				election.parties.by.id[id] = party;
			}
			return id;
		}
		for( var row, iRow = -1; row = rows[++iRow]; ) {
			var id = fixup( geoid, row[colID], features, geo.table);
			if( id === null ) continue;
			rowsByID[id] = row;
			var max = 0;
			row.candidateMax = -1;
			var candidates = row.candidates = [];
			for( var iCol = 0;  iCol < colID;  iCol += colIncr ) {
				var tabCount = row[iCol];
				var candidateName = multiColumn ? row[iCol+1] : '';
				// iCol+2 = last name is skipped.
				var partyID = multiColumn ? row[iCol+3] : extractPartyId(cols[iCol]);
				var party = election.parties.by.id[partyID];
				if (!party) {
					if (multiColumn && !candidateName) {
						continue;  // padded at the end.
					}
					console && console.log && console.log('no party for id ' + partyID);
				}
				var candidate = {
					id: partyID,
					party: party,
					name: candidateName
				};
				candidates.push( candidate );
				rowT[ colT['TabCount-' + partyID] ] += tabCount;
				if (party.synthetic) {
					rowT[colT.InvalidTotal] += tabCount;
				} else {
					rowT[colT.ValidTotal] += tabCount;
				}
				if( tabCount > max ) {
					row.candidateMax = candidates.length - 1;
					max = tabCount;
				}
			}
			rowT[colT.TabTotal] += row[col.TabTotal];
			rowT[colT.NumBallotBoxes] += row[col.NumBallotBoxes];
			rowT[colT.NumCountedBallotBoxes] += row[col.NumCountedBallotBoxes];
		}
		var missing = [];
		if( debug  &&  ! features.didMissingCheck ) {
			for( var row, iRow = -1;  row = rows[++iRow]; ) {
				var id = row[colID];
				if( ! features.by[id] )
					missing.push( S( id, ' in results but not in GeoJSON' ) );
			}
			for( var feature, iFeature = -1;  feature = features[++iFeature]; ) {
				var id = feature.id;
				if( ! rowsByID[id] )
					missing.push( S( id, ' in GeoJSON but not in results' ) );
			}
			features.didMissingCheck = true;
		}
		
		if( electionsPending.length == 0 )
			geoReady();
		
		if( debug == 'verbose'  ||  ( missing.length  &&  debug  &&  debug != 'quiet' ) ) {
			if( ! missing.length ) missing.push( 'none' );
			alert( S( 'Missing locations:\n', missing.sort().join( '\n' ) ) );
		}
	}
	
	function objToSortedKeys( obj ) {
		var result = [];
		for( var key in obj ) result.push( key );
		return result.sort();
	}
	
	var blank = imgUrl( 'blank.gif' );
	
	$('body.interactive a.logo')
		.css({ opacity: .5 })
		.mouseover( function() {
			$(this).stop().fadeTo( 250, 1 );
		})
		.mouseout( function() {
			$(this).stop().fadeTo( 500, .5 );
		});
	
	$window
		.bind( 'resize', resizeView );

        $(document).ready(function() {
            console.log('initial load ', current);
            loadView();
            console.log('loaded: ', current);
        });
	
	getScript( S(
		location.protocol == 'https:' ? 'https://ssl' : 'http://www',
		'.google-analytics.com/',
		debug ? 'u/ga_debug.js' : 'ga.js'
	) );
	
	analytics( 'map', 'load' );
	
	$('#error').ajaxError(function(evt, xhr, settings, error) {
		console.log('Ajax error: ', error, xhr);
		$(this).append(S('<div> Ajax error: ', error, '</div>'));
		if (debug) {
			$(this).show();
			throw error;
        }
	});
	
})( jQuery );
