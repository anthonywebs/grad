'use strict';

const PIC_LIST = [1, 2, 3];
let NEXT_PIC = 0;
let CURRENT_PIC = PIC_LIST.length - 1;
let SLIDE_STOP = false;
let SCROLL_HEIGHT = 0;
let SCROLL_DETECT_DONE = false;
let IS_WAVE_TOP = true; // music effect top or bottom

const SONG_LIST = [
  {
    owner: 'Anthony',
    title: 'Vitamin C - Graduation (Friends Forever)',
    path: './media/grad.m4a',
    weight: 60,    
  }, 
  {
    owner: 'Anthony',
    title: 'Limahl - Never Ending Story',
    path: './media/neverending.m4a',
    weight: 20,
  }, 
  {
    owner: 'Anthony',
    title: 'UP - Married Life',
    path: './media/up.mp3',
    weight: 10,
  }, 
  {
    owner: 'Anthony',
    title: 'Kina Grannis - Can\'t Help Falling In Love',
    path: './media/song-fallin.m4a',
    weight: 10,
  }, 
  {
    owner: 'Anthony',
    title: 'One Republic - Good Life',
    path: './media/goodlife.m4a',
    weight: 20,
  }, 
  // {
  //   owner: 'Anthony',
  //   title: 'Si Tu Vois Ma Mère – Tatiana Eva-Marie & Avalon Jazz Band',
  //   path: './media/situ.mp3',
  //   weight: 10,
  // }, 
];
let SONG_TRACK = 0;

let runDraw = undefined; // draw closure

const runEveryX = freq => {
    let count = 0;
    return () => {
        count = (count + 1) % freq;
        return count === 0; 
    }
}

const displayAudioEffect = () => {

  const topCanvas = document.getElementById('js-top-visualizer');
  const topContext = topCanvas.getContext('2d');
  topCanvas.width = topCanvas.offsetWidth;
  topCanvas.height = topCanvas.offsetHeight;

  const leftCanvas = document.getElementById('js-signature');
  const leftContext = leftCanvas.getContext('2d');
  leftCanvas.width = leftCanvas.offsetWidth;
  leftCanvas.height = leftCanvas.offsetHeight;

  // Connect the audio source to the analyser node
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const audioEl = document.getElementById('js-audio');
  const audioSource = audioContext.createMediaElementSource(audioEl);
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);

  // Set up the analyser node
  analyser.fftSize = 256; // default 256
  const bufferLength = analyser.frequencyBinCount - 38; // 90
  const dataArray = new Uint8Array(bufferLength); 

  const runThis = runEveryX(4); // 60fps


  // for small top control
  const centerY = topCanvas.height / 2;
  const peakFactor = 0.04; // peak length
  const peakCount = 30; // number of points
  const peakMod = bufferLength / peakCount;
  const startX = 20;

    // Load the image of "Diane" once
  const image = new Image();
  image.src = './img/diane2.png';  // Path to your "Diane" image
  
  // Wait for the image to load before using it
  image.onload = () => {
    // Image is ready to be drawn on the canvas
    // console.log('Image loaded successfully');
  };

  // Draw the js-visualizer
  const draw = () => {
    if (audioEl.paused) {
      // pauseMusic();
      return;
    }
    
    analyser.getByteFrequencyData(dataArray);

    if (runThis()) {
    // if (true) { // for now, full fames 128fps
      
      // top control
      topContext.clearRect(0, 0, topCanvas.width, topCanvas.height);


      // topContext.strokeStyle = '#ff5a00';
      topContext.strokeStyle = '#000';

      topContext.lineWidth = !isLandscape() ? 5: 7; // circle width
      topContext.lineJoin = "round";

      topContext.lineWidth = 1; // wave line width

      let togglePeak = -1;
      topContext.beginPath();
      topContext.moveTo(0, centerY);

      topContext.lineTo(startX, centerY);


      for (let i = 0; i < bufferLength - 10; i++) {
        // small top control
        if (i > 0 && i % peakMod === 0) {
          let dist = dataArray[i];
          dist = dist > 64 ? dist - 64 : 0; // make wave look bigger diff
          const peakY = dist * peakFactor * togglePeak;
          togglePeak *= -1;
          topContext.lineTo(startX + topCanvas.width * i / bufferLength, centerY - peakY);
        }
      }
      topContext.moveTo(bufferLength, centerY);
      topContext.moveTo(bufferLength + 130, centerY);



      topContext.stroke();
      topContext.closePath();

      // After image is loaded, draw it to the canvas
      if (image.complete) { // Only draw image if it's loaded
        // Draw the image onto the canvas
        leftContext.drawImage(image, 0, 0);
      }

      
    }
    

    requestAnimationFrame(draw);  // i don't want recursion, but no choice
  }

  return draw; // make closure
}


function playNext() {
  $('#js-music-info').css('display', 'none');
  SONG_TRACK++;
  if (SONG_TRACK === SONG_LIST.length) SONG_TRACK = 0;
  $('audio').attr('src', SONG_LIST[SONG_TRACK].path);
  document.getElementById('js-audio').play();
  $('#js-owner').text(SONG_LIST[SONG_TRACK].owner);
  $('#js-music-title').text(SONG_LIST[SONG_TRACK].title);    
  $('#js-music-info').css('display', 'block');
}

function fadeOut2(i) {
  if (i >= 1) {
    // $('#js-page-loader').css('display', 'none');
    $('#js-more-pic').css('display', 'block');
    $('#js-btn-mute-2').css('display', 'flex');
    $('#js-msg-bottom').css('display', 'block');
    $('#js-greeting').css('display', 'block');
    $('#js-copy-right').css('display', 'block');
    $('#js-wave').css('z-index', '9999');
    $('#js-music-info').removeClass('hidden');

    return;
  }

  setTimeout(() => {
    $('#js-cover-greeting-3').css('opacity', i);
    fadeOut2(i + 0.02);
  }, 15)
}

// i opacity
function fadeOut1(i) {
  if (i >= 1) {
    return setTimeout(() => {
      $('#js-cover-greeting-3').removeClass('hidden');
      return fadeOut2(0);
    }, 1000)
  }

  setTimeout(() => {
    $('#js-cover-greeting-2').css('opacity', i);
    fadeOut1(i + 0.02);
  }, i < 0.2 ? 100 : 15)

}
function playMusic() {
  document.getElementById('js-audio').play();
  $('#js-owner').text(SONG_LIST[SONG_TRACK].owner);
  $('#js-music-title').text(SONG_LIST[SONG_TRACK].title);
  $('#js-greeting-text').hide();
  $('#js-msg-bottom').css('display', 'none');
  $('.intro').css('display', 'none');
  $('#js-main-img').addClass('fi_short');  
  
  const maxHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  
  if (!runDraw) {
    runDraw = displayAudioEffect();
  }
  runDraw();

  $('#js-cover-greeting-2').removeClass('hidden');
  fadeOut1(0); 
}

function changeBackground() {
  SLIDE_STOP = true; // stop slide show

  $('#js-cover-greeting-3').css('background-image', `url('./img/main_next${!isLandscape() ? 'm' : ''}.jpg')`);
}

function stopMusic() {
  document.getElementById('js-audio').pause();
  $('#js-stop').addClass('hidden');
  $('#js-play').removeClass('hidden');
}

function resumeMusic() {
  document.getElementById('js-audio').play();
  $('#js-play').addClass('hidden');
  $('#js-stop').removeClass('hidden');
  if (!runDraw) {
    runDraw = displayAudioEffect();
  }
  runDraw();
}

function toggleFullList() {
  const listLength = $('#js-future-meetings').attr("cnt");

  $('#js-future-meetings').attr("cnt", listLength === "1" ? "0" : "1");
  renderFutureMeetings();
}

function openHelp() {
  $('#js-help').removeClass('hidden');
  $('#js-popup-bg').removeClass('hidden');
}

function closeHelp() {
  $('#js-help').addClass('hidden');
  $('#js-popup-bg').addClass('hidden');
}

function isLandscape () {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  return width > height;

}

function getSrc (name) {
  return `./img/${name}${isLandscape() ? '' : 'm'}.jpg`;
}

function renderMainImage() {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  const isLandscape = width > height;
  const heightFactor = isLandscape ? 0.8 : 0.6;
  const bottomFactor = isLandscape ? '20%' : '40%';
  const greetingTopFactor = isLandscape ? 0.65 : 0.63;
  // const greetingTopFactor = isLandscape ? 0.7 : 0.53;
  SCROLL_HEIGHT = height*greetingTopFactor*1.1;

  $('#js-bottom').css('margin-top', height*greetingTopFactor*1.05);
  // $('.intro').css('height', height * heightFactor);
  // $('.intro').css('bottom', bottomFactor);
  $('.intro').css('top', 0);
  // $('.intro').css('height', isLandscape ? '796px' : '1vh');

  $('#js-1').attr('src', getSrc('1-book2'));
  // $('#js-2').attr('src', getSrc('2-book'));
  $('#js-2').attr('src', getSrc('1-window'));
  $('#js-4').attr('src', getSrc('6-bart'));
  $('#js-5').attr('src', getSrc('1-horse'));
  $('#js-5a').attr('src', getSrc('7-class'));
  $('#js-6').attr('src', getSrc('8-thennow'));
  $('#js-6a').attr('src', getSrc('9-group'));
  $('#js-7').attr('src', getSrc('5-sol'));

  
  if (!isLandscape) {
    $('.intro').css('object-fit', `contain`);
    $('#js-main-img-next').attr('src', './img/main_nextm.jpg');

    $('#js-cover-greeting').css('background-size', 'contain');
    $('#js-cover-greeting').css('background-image', 'url(' + './img/main-1m.jpg' + ')');
    $('#js-cover-greeting-2').css('background-image', 'url(' + './img/main-2m.jpg' + ')');
    $('#js-cover-greeting-3').css('background-image', 'url(' + './img/main-4m.jpg' + ')');
    $('#js-cover-greeting-2').css('background-size', 'contain');
    $('#js-cover-greeting-3').css('background-size', 'contain');
    $('#js-greeting').css('background-position', 'top right');
    $('#js-greeting').css('background-size', '100%');
    $('#js-mobile-logo').css('width', '240px');
    $('.img_p, .img_l').css('padding', '7% 0');
    $('.img_p, .img_l').css('margin-bottom', '11%');
    $('.font_m').css('font-size', '1.4rem');
    $('.font_detail').css('font-size', '16px');
    $('.btn_black').addClass('btn_mobile');
    $('#js-warning').addClass('warning_mobile');
  }

  if (width < 1200) {
    $('.img_l').css('width', '100%');
    $('.img_p').css('width', '90%');
  }
}

function handleEvent() {
  // SONG_LIST.sort((a, b) => {
  //   const aRand = Math.random() + a.weight/100;
  //   const bRand = Math.random() + b.weight/100;
  //   return bRand - aRand;
  // });

  $('audio').attr('src', SONG_LIST[SONG_TRACK].path);

  $('audio').on({
    ended: function() {
      SONG_TRACK++;
      if (SONG_TRACK === SONG_LIST.length) SONG_TRACK = 0;
      $('audio').attr('src', SONG_LIST[SONG_TRACK].path);
      window.document.querySelector('audio').play();
      $('#js-owner').text(SONG_LIST[SONG_TRACK].owner);
      $('#js-music-title').text(SONG_LIST[SONG_TRACK].title);    
    }
  });

  window.onscroll = function (e) { 
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const position = window.scrollY;
    const waveEl = document.getElementById('js-wave');
    const btnEl = document.getElementById('js-btn-mute-2');

    if (IS_WAVE_TOP && position > screenHeight * 1.5) {
      document.getElementById('js-wave-bot').appendChild(waveEl);
      document.getElementById('js-btn-bot').appendChild(btnEl);
      IS_WAVE_TOP = false;
    }

    if (!IS_WAVE_TOP && position < screenHeight * 1.5) {
      document.getElementById('js-wave-top').appendChild(waveEl);
      document.getElementById('js-btn-top').appendChild(btnEl);
      IS_WAVE_TOP = true;
    }

    if (!SCROLL_DETECT_DONE && position > SCROLL_HEIGHT) {
      changeBackground();
      SCROLL_DETECT_DONE = true;
    }
  }
}

async function slideShowPlay() { 
  if (SLIDE_STOP === true) {
    $('#js-main-img1').hide();
    $('#js-main-img2').hide();
    $('#js-main-img3').hide();  
    return;
  }
  
  $(`#js-main-img${PIC_LIST[CURRENT_PIC]}`).css('z-index', '-2');
  $(`#js-main-img${PIC_LIST[NEXT_PIC]}`).css('display', 'block');
  setTimeout(function() {
    $(`#js-main-img${PIC_LIST[CURRENT_PIC]}`).css('z-index', '-1');
    $(`#js-main-img${PIC_LIST[CURRENT_PIC]}`).css('display', 'none');
    CURRENT_PIC = NEXT_PIC;
    NEXT_PIC = (NEXT_PIC + 1) % PIC_LIST.length;
    slideShowPlay();
  }, 6000);
}

$(_=> {
  handleEvent();
  renderMainImage();
});
