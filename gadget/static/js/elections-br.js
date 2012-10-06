// elections-fr.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

var candidates2012 = [
	// Candidate order must match the candidate-photos image for this election
	{ color: '#33FF00', id: '11', firstName: 'Renly', lastName: 'Baratheon', fullName: 'Renly Baratheon' },
	{ color: '#169E28', id: '12', firstName: 'Robert', lastName: 'Baratheon', fullName: 'Robert Baratheon' },
	{ color: '#DDDDDD', id: '13', firstName: 'Eddard', lastName: 'Stark', fullName: 'Eddard Stark' },
	{ color: '#3366CC', id: '14', firstName: 'Balon', lastName: 'Greyjoy', fullName: 'Balon Greyjoy' },
	{ color: '#DCDC00', id: '10', firstName: 'Danaerys', lastName: 'Targaryen', fullName: 'Danaerys Targaryen' },
	{ color: '#A00000', id: '15', firstName: 'Joffrey', lastName: 'Lannister', fullName: 'Joffrey Lannister' },
	{ color: '#AF00A0', id: '16', firstName: 'Doran', lastName: 'Martell', fullName: 'Doran Martell' },
	{ color: '#FF0000', id: '17', firstName: 'Stannis', lastName: 'Baratheon', fullName: 'Stannis Baratheon' },
];

var parties2012 = [
	// Blank and null pseudo-parties must come first, in that order.
	{ color: '#FFFFFF', label:'Brancos', id: '00', name: 'Votos em branco', sortKey: -1, synthetic: true },
	{ color: '#000000', label:'Nulos', id: '01', name: 'Nulos', sortKey: -2, synthetic: true },
	{ color: '#4DC706', label:  'PRB', id: '10', name: 'P. Republicano Brasileiro' },
	{ color: '#169E28', label:   'PP', id: '11', name: 'P. Progressista' },
	{ color: '#F00000', label:  'PDT', id: '12', name: 'P. Democr&aacute;tico Trabalhista' },
	{ color: '#001EFF', label:   'PT', id: '13', name: 'P. dos Trabalhadores' },
	{ color: '#000000', label:  'PTB', id: '14', name: 'P. Trabalhista Brasileiro' },
	{ color: '#EF4BB6', label: 'PMDB', id: '15', name: 'P. do Movimento Democr&aacute;tico Brasileiro' },
	{ color: '#DE7676', label: 'PSTU', id: '16', name: 'P. Socialista dos Trabalhadores Unificado' },
	{ color: '#A3A3A3', label:  'PSL', id: '17', name: 'P. Social Liberal' },
	{ color: '#1BA5E0', label:  'PTN', id: '19', name: 'P. Trabalhista Nacional' },
	{ color: '#696969', label:  'PSC', id: '20', name: 'P. Social Crist&atilde;o' },
	{ color: '#1006C7', label:  'PCB', id: '21', name: 'P. Comunista Brasileiro' },
	{ color: '#0B65E3', label:   'PR', id: '22', name: 'P. da Rep&uacute;blica' },
	{ color: '#F58522', label:  'PPS', id: '23', name: 'P. Popular Socialista' },
	{ color: '#752A0C', label:  'DEM', id: '25', name: 'Democratas' },
	{ color: '#D8F70A', label: 'PSDC', id: '27', name: 'P. Social Democrata Crist&atilde;o' },
	{ color: '#FF0059', label: 'PRTB', id: '28', name: 'P. Renovador Trabalhista Brasileiro' },
	{ color: '#9F1D35', label:  'PCO', id: '29', name: 'P. da Causa Oper&aacute;ria' },
	{ color: '#000033', label:  'PHS', id: '31', name: 'P. Humanista da Solidariedade' },
	{ color: '#000033', label:  'PMN', id: '33', name: 'P. da Mobiliza&ccedil;&aacuteo Nacional' },
	{ color: '#000033', label:  'PTC', id: '36', name: 'P. Trabalhista Crist&atilde;o' },
	{ color: '#000033', label:  'PSB', id: '40', name: 'P. Socialista Brasileiro' }, 
	{ color: '#000033', label:   'PV', id: '43', name: 'P. Verde' },
	{ color: '#000033', label:  'PRP', id: '44', name: 'P. Republicano Progressista' },
	{ color: '#000033', label: 'PSDB', id: '45', name: 'P. da Social Democracia Brasileira' },
	{ color: '#000033', label: 'PSOL', id: '50', name: 'P. Socialismo e Liberdade' },
	{ color: '#000033', label:  'PEN', id: '51', name: 'P. Ecol&oacute;gico Nacional' },
	{ color: '#000033', label:  'PPL', id: '54', name: 'P. P&aacute;tria Livre' },
	{ color: '#000033', label:  'PSD', id: '55', name: 'P. Social Democr&aacute;tico' },
	{ color: '#000033', label:'PCdoB', id: '65', name: 'P. Comunista do Brasil' },
	{ color: '#000033', label:'PTdoB', id: '70', name: 'P. Trabalhista do Brasil' }
];

var testParties = [
	// Blank and null pseudo-parties must come first, in that order.
	{ color: '#FFFFFF', label:'Brancos', id: '00', name: 'Votos em branco', sortKey: -1, synthetic: true },
	{ color: '#000000', label:'Nulos', id: '01', name: 'Nulos', sortKey: -2, synthetic: true },
	{ color: '#169E28', label: 'P71', id: '71', name: 'P. 71'},
	{ color: '#F00000', label: 'P72', id: '72', name: 'P. 72' },
	{ color: '#001EFF', label: 'P73', id: '73', name: 'P. 73' },
	{ color: '#000000', label: 'P74', id: '74', name: 'P. 74' },
	{ color: '#EF4BB6', label: 'P75', id: '75', name: 'P. 75' },
	{ color: '#DE7676', label: 'P76', id: '76', name: 'P. 76' },
	{ color: '#A3A3A3', label: 'P77', id: '77', name: 'P. 77' },
	{ color: '#1BA5E0', label: 'P78', id: '78', name: 'P. 78' },
	{ color: '#696969', label: 'P79', id: '79', name: 'P. 79' },
	{ color: '#1006C7', label: 'P80', id: '80', name: 'P. 80' },
	{ color: '#1006C7', label: 'P81', id: '81', name: 'P. 81' }
];

testParties.blankID = parties2012.blankID = '00';
testParties.nullID = parties2012.nullID = '01';

var elections = {
	'2012': {
		date: '2012-10-22',
		tzHour: -3,
		photos: false,
		candidates: candidates2012,
		allParties: [parties2012, testParties],
		parties: parties2012,
		electionids: {
			'BR': 2793,
			'AC': 2794,
			'AL': 2795,
			'AM': 2796,
			'AP': 2797,
			'BA': 2798,
			'CE': 2799,
			'DF': 0,
			'ES': 2800,
			'GO': 2801,
			'MA': 2802,
			'MG': 2803,
			'MS': 2804,
			'MT': 2805,
			'PA': 2806,
			'PB': 2807,
			'PE': 2808,
			'PI': 2809,
			'PR': 2810,
			'RJ': 2811,
			'RN': 2812,
			'RO': 2813,
			'RR': 2814,
			'RS': 2815,
			'SC': 2816,
			'SE': 2817,
			'SP': 2818,
			'TO': 2819
		}
	}
};
