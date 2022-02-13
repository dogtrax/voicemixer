// backstrech the background image -->
 $.backstretch("background.jpg");


// All thee voice data. id=base name for audio file, name=how to display on page, segments indicate which of the ones the voices are availble
var people = [
	{"id" : "kevin" , "name" : "Kevin", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	{"id" : "sheri" , "name" : "Sheri", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	{"id" : "terry" , "name" : "Terry", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	{"id" : "charlene" , "name" : "Charlene", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	{"id" : "sarah" , "name" : "Sarah", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	{"id" : "alan" , "name" : "Alan", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	{"id" : "wendy" , "name" : "Wendy", "segments" : [1,2,3,4,5,6,7,8,9]}, 
	
];

// the text for each segment, will be displayed under speakers name as it plays

var segment_text = [
	"Voice",
	"Word",
	"Poem",
	"Whose voice is this?",
	 "a crackle in the dust from the corner of the room",
	"Whose word is this?",
	"remnants of the rust of a song sung out of tune",
	"Whose poem is this?",
	"ink scratched with brush, stories from a falling moon"
]

// number of segments in this mix
var numsegments = 5; 

// lame I know, global variables. Ugly. Sue me

var voices = []; // holds voices in this mix
var speakers = []; // lists speaker names used
var sndx = -1; // current item to play in voices[]
var paused = false; // pause state


// 
function getrandom( array ) {
	// Fisher-Yates Shuffle h/t https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	 }
	 // return the last element of the shuffle array
	 return array.pop();
}

function getAllNames() {
	let allnames = [];
	for  (let m = 0; m < people.length ; m++) {
		allnames.push(people[m].name);
	}
	
	$( "#namelist" ).html('<p>Thanks to all voice contributors <strong>' + allnames.sort().join("</strong>, <strong>") + '</strong></p>');
}

function mixaudio(max) {
	$( "#speaking" ).text('Mixing...');
	let alltracks = [];
	let track2 = [];
	let credits = [];
	let ffmpegtxt = '# Voice Mix created ' + new Date() + "\n" + 
					'# Run from directory containing \'audio\'' + "\n" + 
					'# ffmpeg -f concat -safe 0 -i voices.txt -c copy voicemix.mp3' + "\n" ;
	paused = false;
	speakers = [];

	for  (let m = 1; m <= max; m++) {

		// find all people that have this in their segments
		inthemix = people.filter(inthemix => inthemix.segments.includes(m));
				
		// grab a person in these results
		randomperson = getrandom(inthemix);
	
		// add the track file name, relative
		alltracks.push(new Audio('audio/segment-'+ m + '/' + randomperson.id + '-' + m + '.mp3'));
	
		// append to credits if not already there, add to speakers list too
		if (!credits.includes( randomperson.name) ) credits.push(randomperson.name);
		speakers.push(randomperson.name);
		
		ffmpegtxt += 'file \'' + 'audio/segment-'+ m + '/' + randomperson.id + '-' + m + ".mp3'\n";
		
	}
	
	// append the credits to the download content
	ffmpegtxt += '# Voice credits: ' + credits.join(", ");
		
	$( "#credits" ).html('<h2>Voice Credits For This Mix</h2><p>' + credits.join(", ") + '</p>');
	$( "#voicelist" ).text(ffmpegtxt);
	$( "#downloadmix").attr("href", "data:text/plain;charset=UTF-8," + encodeURIComponent(ffmpegtxt));
	$( "#speaking" ).html('Mix complete! Click <strong>Play</strong> to listen');
	
	return (alltracks);
}

function getVoices() {

	// pause if playing and we are not at end
	if ( sndx > -1 && sndx < voices.length  && !paused) {
		voices[sndx].pause();
		paused=true;
	}
	
	// reset counter and create a new mix
	sndx = -1;
	voices = mixaudio(numsegments);

	// change button names and show buttons
	$("#voicenew").html('Make Another');
	$("#voiceplay").show();
	$("#voicepause").show();
	$("#mixlist").show();

}

function playVoices() {
	if (paused) {
		paused = false;
	} else {
		
		sndx++;
		if (sndx == voices.length) {
			// we are done
			$("#speaking").html('Done! Mix another?');
			return;
		}
		
		// start next voice, add event for when ended to play next
		voices[sndx].addEventListener('ended', playVoices);
		
		// update disply
		$("#speaking").html('<i class="bi bi-volume-up-fill"></i> <em>' + speakers[sndx] + '<br />"' + segment_text[sndx] +  '"</em>');
	}
	
	// play away
	voices[sndx].play();
}

function pauseVoices() {
	voices[sndx].pause();
	paused = true;

}

// set up the table
$(document).ready(function(){	
	getAllNames();
	
	$( "#voicenew" ).click(function() {
		// Generate a new mix
		getVoices();
		
	});	
	
	$( "#voiceplay" ).click(function() {
		// play voices
		playVoices();
		
	});	
	
	$( "#voicepause" ).click(function() {
		// pause voices
		pauseVoices();
		
	});	
				
});//ready
