const controller = new AbortController();

const pSBC = (p, c0, c1, l) => {
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    i = parseInt,
    m = Math.round,
    a = typeof c1 == 'string';
  if (
    typeof p != 'number' ||
    p < -1 ||
    p > 1 ||
    typeof c0 != 'string' ||
    (c0[0] != 'r' && c0[0] != '#') ||
    (c1 && !a)
  )
    return null;
  if (!this.pSBCr)
    this.pSBCr = (d) => {
      let n = d.length,
        x = {};
      if (n > 9) {
        ([r, g, b, a] = d = d.split(',')), (n = d.length);
        if (n < 3 || n > 4) return null;
        (x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))),
          (x.g = i(g)),
          (x.b = i(b)),
          (x.a = a ? parseFloat(a) : -1);
      } else {
        if (n == 8 || n == 6 || n < 4) return null;
        if (n < 6)
          d =
            '#' +
            d[1] +
            d[1] +
            d[2] +
            d[2] +
            d[3] +
            d[3] +
            (n > 4 ? d[4] + d[4] : '');
        d = i(d.slice(1), 16);
        if (n == 9 || n == 5)
          (x.r = (d >> 24) & 255),
            (x.g = (d >> 16) & 255),
            (x.b = (d >> 8) & 255),
            (x.a = m((d & 255) / 0.255) / 1000);
        else
          (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
      }
      return x;
    };
  (h = c0.length > 9),
    (h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
    (f = this.pSBCr(c0)),
    (P = p < 0),
    (t =
      c1 && c1 != 'c'
        ? this.pSBCr(c1)
        : P
        ? { r: 0, g: 0, b: 0, a: -1 }
        : { r: 255, g: 255, b: 255, a: -1 }),
    (p = P ? p * -1 : p),
    (P = 1 - p);
  if (!f || !t) return null;
  if (l)
    (r = m(P * f.r + p * t.r)),
      (g = m(P * f.g + p * t.g)),
      (b = m(P * f.b + p * t.b));
  else
    (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
      (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
      (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
  (a = f.a),
    (t = t.a),
    (f = a >= 0 || t >= 0),
    (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
  if (h)
    return (
      'rgb' +
      (f ? 'a(' : '(') +
      r +
      ',' +
      g +
      ',' +
      b +
      (f ? ',' + m(a * 1000) / 1000 : '') +
      ')'
    );
  else
    return (
      '#' +
      (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
        .toString(16)
        .slice(1, f ? undefined : -2)
    );
};

const isSupported = () =>
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }
  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  document.getElementById(cityName).style.display = 'flex';
  evt.currentTarget.className += ' active';

  /*    document.querySelector(".attachments").scrollIntoView({
        top: document.querySelector(".tab"),
    });*/
}

document.querySelectorAll('.tablinks')[0].click();

function close_audio_div_func() {
  document
    .querySelector('.audio_title_div')
    .setAttribute('style', 'display: none');
  document.querySelector('.hidden_audio').pause();
  play_check = 1;
}

function go_home_page_func() {
  room = 0;
  document.documentElement.style.setProperty('--swipe-margin-inactive', `100%`);
  document.documentElement.style.setProperty(
    '--swipe-margin-choose-list',
    `0%`
  );
  document.querySelector('.choose_list').classList.remove('swiped');
  document.querySelector('#room_id').value = room;
  document.querySelector('#name').value = '';
  //   window.location.hash = room;
  window.history.replaceState(null, null, `#${room}`);
  load_check = 1;
  load_photo_check = 0;
  clearChatTimeOutTime = 0;
  //   document.querySelector(".search_field").focus();
  if (window.innerWidth < 768) {
    clearChatTimeOutTime = 350;
  }

  clearChatTimeOut = setTimeout(() => {
    $('#display').empty();
    document.querySelector('#post-form').classList.add('hidden');
    document.querySelector('#opponent_title_name').classList.add('hidden');
  }, clearChatTimeOutTime);

  //        document.querySelector("#select_chat_to_start").style.display = "inline-block";

  //        document.querySelector(".send_div").style.display = "none";
  //        document.querySelector("#opponent_title_name").style.display = "none";
  adapt();
  document.querySelectorAll('.users_full_form').forEach(function (e) {
    e.classList.remove('active');
  });
}

prev_audio_link = '';

function enableDoubleTap(element, callback) {
  let lastTap = 0;
  let tapTimeout;
  let isTapValid = true;

  element.addEventListener(
    'touchstart',
    function (event) {
      isTapValid = true;

      if ($('.textarea').is(':focus')) $('.textarea').focus();
    },
    { passive: false }
  );

  element.addEventListener(
    'touchmove',
    function (event) {
      isTapValid = false;
    },
    { passive: false }
  );

  element.addEventListener('touchend', function (event) {
    if (event.target.closest('.user_file_pres')) return;
    if (event.cancelable) event.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (!isTapValid) {
      lastTap = 0;
      clearTimeout(tapTimeout);
      return;
    }

    if (tapLength < 500 && tapLength > 0) {
      clearTimeout(tapTimeout);
      callback.call(this, event);
      lastTap = 0;
    } else {
      lastTap = currentTime;
      clearTimeout(tapTimeout);

      tapTimeout = setTimeout(() => {
        $('.textarea').blur();
      }, 500);
    }
  });

  element.addEventListener('click', function (event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 500 && tapLength > 0) {
      clearTimeout(tapTimeout);
      callback.call(this, event);
      lastTap = 0;
    } else {
      lastTap = currentTime;
      clearTimeout(tapTimeout);

      tapTimeout = setTimeout(() => {
        $('.textarea').blur();
      }, 500);
    }
  });
}

window.addEventListener('beforeunload', (event) => {
  if (window.location.hash) {
    event.returnValue = '';
    return '';
  }
});

function audio_play(index) {
  link = audio_files[index];

  lastIndexOf_ =
    link.lastIndexOf('_') == -1 ? link.lastIndexOf('.') : link.lastIndexOf('_');
  file_name = link.slice(link.indexOf('media') + 6, lastIndexOf_);
  file_new_name = decodeURIComponent(
    file_name.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&')
  );
  file_type_from_name = link.slice(link.lastIndexOf('.'));
  complete_file_name = file_new_name + file_type_from_name;

  if (link != prev_audio_link) {
    prev_audio_link = link;
    (async () => {
      const controller_audio = new AbortController();
      const signal_audio = controller_audio.signal;
      link_fetch = await fetch(link, {
        method: 'get',
        signal: signal_audio,
      }).catch(function (err) {
        console.log('ERROR');
      });

      link_audio = URL.createObjectURL(await link_fetch.blob());

      document
        .querySelector('.audio_title_div')
        .setAttribute('style', 'display: unset');

      $('#file_name_title_div').empty();
      document.querySelector('#file_name_title_div').append(complete_file_name);
      document.querySelector('.hidden_audio').src = link_audio;

      document.querySelector('.hidden_audio').play();
      play_check = 0;

      audio_interval = setInterval(function slider_move() {
        document.querySelector('#audio-slider').value =
          (document.querySelector('.hidden_audio').currentTime /
            document.querySelector('.hidden_audio').duration) *
          1000000;
        if (
          document.querySelector('.hidden_audio').currentTime ==
            document.querySelector('.hidden_audio').duration &&
          index != 0
        ) {
          audio_play(index - 1);
          document.querySelector('.hidden_audio').currentTime = 0;
          clearInterval(audio_interval);
        }
      }, 25);
    })();
  } else {
    if (!document.querySelector('.hidden_audio').paused) {
      document.querySelector('.hidden_audio').pause();
      clearInterval(audio_interval);
    }
    //            else{
    //                document.querySelector(".hidden_audio").play();
    //                audio_interval = setInterval(function slider_move() {
    //                    document.querySelector("#audio-slider").value = document.querySelector(".hidden_audio").currentTime / document.querySelector(".hidden_audio").duration * 1000000;
    //                    if(document.querySelector(".hidden_audio").currentTime == document.querySelector(".hidden_audio").duration && index != 0){
    //                        clearInterval(audio_interval);
    //
    //                        audio_play(--index);
    //                    }
    //                }, 25);
    //            }
  }
}

function seek() {
  document.querySelector('.hidden_audio').currentTime =
    (document.querySelector('#audio-slider').value *
      document.querySelector('.hidden_audio').duration) /
    1000000;
}

timer_touch_contextMenu = setTimeout('', 0);

// $(document).on('touchstart', function(e) {
//     document.querySelector("body").classList.add("selection");
//     var x = e.originalEvent.touches[0].pageX;
//     var y = e.originalEvent.touches[0].pageY;

//     timer_touch_contextMenu = setTimeout(function(){

//         contextMenu.style.left = `${x}px`;
//         contextMenu.style.top = `${y}px`;
//         contextMenu.style.display = "unset";

//     }, 500);
// });

document.addEventListener('touchend', (e) => {
  clearTimeout(timer_touch_contextMenu);
  document.querySelector('body').classList.remove('selection');
  document.querySelector('body').oncontextmenu = function (e) {
    e.preventDefault();
  };
});

const contextMenu = document.querySelector('.wrapper'),
  shareMenu = contextMenu.querySelector('.share-menu');
copy = contextMenu.querySelector('.uil uil-copy');

window.document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
  // getStreamCode();
});

function getSelectionText() {
  var text = '';
  var activeEl = document.activeElement;
  var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    activeElTagName == 'textarea' ||
    (activeElTagName == 'input' &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
      typeof activeEl.selectionStart == 'number')
  ) {
    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
  } else if (window.getSelection) {
    text = window.getSelection().toString();
  }
  document.execCommand('copy');

  return text;
}

var saveText = function () {
  var selectionText = getSelectionText();
  document.getElementById('sel').innerHTML = selectionText;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(
    JSON.stringify({
      note: selectionText,
    })
  );
};

function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function txtdecode(Incode, passCode) {
  var b52 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var maxPC = 0;
  for (var i = 0; i < passCode.length; i++) maxPC += passCode.charCodeAt(i);
  maxPCmod = maxPC;
  ifPC = 0;
  var Incode = Incode.match(/\d+\w/g);
  var rexcode = '';
  var numPC = 0;
  if (Incode == null) Incode = [];
  for (var i = 0; i < Incode.length; i++) {
    if (numPC == passCode.length) numPC = 0;
    if (maxPCmod < 1) maxPCmod = maxPC + ifPC;
    ifPC += maxPCmod % passCode.charCodeAt(numPC);
    var iscode = maxPCmod % passCode.charCodeAt(numPC);
    var nCode =
      parseInt(Incode[i]) * 52 + parseInt(b52.indexOf(Incode[i].substr(-1)));
    maxPCmod -= passCode.charCodeAt(numPC);
    numPC++;
    rexcode += String.fromCharCode(nCode - iscode);
  }

  /*	return rexcode.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/ /g, " ").replace(/\r\n|\r|\n/g,"<br />").replace(/(https?\:\/\/|www\.)([а-яА-Я\d\w#!:.?+=&%@!\-\/]+)/gi, function(url)
	{
		return '<a target="_blank" href="'+ (( url.match('^https?:\/\/') )?url:'http://' + url) +'">'+ url +'</a>';
	});*/
  return rexcode;
}

function txtencode(Incode, passCode) {
  var b52 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var maxPC = (ifPC = 0);
  for (var i = 0; i < passCode.length; i++) maxPC += passCode.charCodeAt(i);
  maxPCmod = maxPC;
  var rexcode = '';
  var numPC = 0;
  for (var i = 0; i < Incode.length; i++) {
    if (numPC == passCode.length) numPC = 0;
    if (maxPCmod < 1) maxPCmod = maxPC + ifPC;
    ifPC += maxPCmod % passCode.charCodeAt(numPC);
    var iscode = maxPCmod % passCode.charCodeAt(numPC);
    var nCode = Incode.charCodeAt(i) + iscode;
    maxPCmod -= passCode.charCodeAt(numPC);
    numPC++;
    rexcode += parseInt(nCode / 52) + b52.charAt(parseInt(nCode % 52));
  }
  return rexcode;
}

function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;

  return function (...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime >= delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

class SecureTextCoder {
  static #ALGORITHM = 'AES-GCM';
  static #SALT_LENGTH = 16;
  static #IV_LENGTH = 12;
  static #KEY_LENGTH = 256;
  static #ITERATIONS = 100000;

  static async encode(plainText, password) {
    if (!plainText || !password) throw new Error('Text and password required');

    try {
      const salt = crypto.getRandomValues(new Uint8Array(this.#SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.#IV_LENGTH));

      const key = await this.#deriveKey(password, salt);

      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);

      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: this.#ALGORITHM,
          iv: iv,
        },
        key,
        data
      );

      const encryptedArray = new Uint8Array(encrypted);
      const result = new Uint8Array(
        salt.length + iv.length + encryptedArray.length
      );

      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(encryptedArray, salt.length + iv.length);

      return this.#arrayToBase64(result);
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  static async decode(encodedText, password) {
    if (!encodedText || !password)
      throw new Error('Encoded text and password required');

    try {
      const data = this.#base64ToArray(encodedText);

      const salt = data.subarray(0, this.#SALT_LENGTH);
      const iv = data.subarray(
        this.#SALT_LENGTH,
        this.#SALT_LENGTH + this.#IV_LENGTH
      );
      const encrypted = data.subarray(this.#SALT_LENGTH + this.#IV_LENGTH);

      const key = await this.#deriveKey(password, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.#ALGORITHM,
          iv: iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  static async #deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Импортируем пароль как ключ
    const importedKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Производим ключ
    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.#ITERATIONS,
        hash: 'SHA-256',
      },
      importedKey,
      {
        name: this.#ALGORITHM,
        length: this.#KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Конвертация Uint8Array в Base64
   */
  static #arrayToBase64(array) {
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Конвертация Base64 в Uint8Array
   */
  static #base64ToArray(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Безопасное хеширование пароля
   */
  static async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const importedKey = await window.crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hash = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.#ITERATIONS,
        hash: 'SHA-256',
      },
      importedKey,
      256
    );

    return `${this.#arrayToHex(salt)}:${this.#arrayToHex(
      new Uint8Array(hash)
    )}`;
  }

  /**
   * Проверка пароля против хеша
   */
  static async verifyPassword(password, storedHash) {
    const [saltHex, hashHex] = storedHash.split(':');
    const salt = this.#hexToArray(saltHex);

    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const importedKey = await window.crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const verifyHash = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.#ITERATIONS,
        hash: 'SHA-256',
      },
      importedKey,
      256
    );

    const verifyHashHex = this.#arrayToHex(new Uint8Array(verifyHash));
    return this.#timingSafeEqual(hashHex, verifyHashHex);
  }

  /**
   * Конвертация массива в hex строку
   */
  static #arrayToHex(array) {
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Конвертация hex строки в массив
   */
  static #hexToArray(hex) {
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return result;
  }

  /**
   * Безопасное сравнение строк (timing-safe)
   */
  static #timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

// Простой пример использования
async function demo() {
  try {
    const original = 'Hello World!';
    const password = 'strong_password_123';

    console.log('Original:', original);

    // Шифрование
    const encoded = await SecureTextCoder.encode(original, password);
    console.log('Encrypted:', encoded);

    // Дешифрование
    const decoded = await SecureTextCoder.decode(encoded, password);
    console.log('Decrypted:', decoded);
    console.log('Match:', original === decoded);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Запуск демо при загрузке страницы
// if (typeof window !== 'undefined') {
//   demo();
// }
let clearChatTimeOut;

window.onload = function () {
  // const themeMeta = document.querySelector('meta[name="theme-color"]');
  const searchDivPlaceHolder = document.querySelector(
    '.search_field_placeholder'
  );
  const textAreaPlaceHolder = document.querySelector('.textarea_placeholder');
  const signal = controller.signal;
  window.history.replaceState(null, null, null);

  all_data_rooms = [];
  let choose_list_swiped;
  ws_protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
  room = document.getElementById('room').value;
  play_check = 1;
  load_check = 1;
  load_photo_check = 0;
  check_redirect = 1;
  sender_ajax = xhr = new XMLHttpRequest();
  first_unread_height = 0;
  all_photos_and_videos = [];
  all_messages_dives = [];
  block_date_dict = [];
  chatSocket = [];
  files_url = [];
  audio_files = [];
  send_allowed = true;
  all_messages = [];
  auto_scroll = true;
  unread_messages = new Set();
  chatSocket_user = null;
  forcibly_close_the_socket = false;

  let send_div_height = document.querySelector('.send_div').clientHeight;
  let opponent_title_name_height = document.querySelector(
    '#opponent_title_name'
  ).clientHeight;

  document.documentElement.style.setProperty(
    '--send_div_height',
    `${send_div_height}px`
  );
  // const sendDiv = document.querySelector('.send_div');

  // sendDiv.ontouchstart = function () {
  //   $('.textarea').focus();
  // };

  var startX = 0;
  var startY = 0;
  var startTime = 0;
  var swipeThreshold = window.innerWidth / 2;
  var velocityThreshold = 200;
  var deltaX = 0;
  var deltaY = 0;
  var isSwiping = false;

  document.querySelector('#display').ontouchstart = function (event) {
    deltaX = 0;
    deltaY = 0;
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
    startTime = Date.now();
    isSwiping = false;
    // if (choose_list_swiped) {
    //   clearTimeout(choose_list_swiped);
    //   choose_list_swiped = null;
    // }

    document.documentElement.style.setProperty('--swipe-margin', `${0}px`);
    document.documentElement.style.setProperty(
      '--swipe-margin-choose-list',
      `-33%`
    );
    document.querySelector('.choose_list').classList.add('swipe');
    document.querySelector('.main_chat_window').classList.add('swipe');
    document
      .querySelector('#display')
      .addEventListener('touchmove', throttleWithRAF(handleSwipeDirection), {
        passive: false,
      });
  };

  function throttleWithRAF(callback) {
    let rafId = null;

    return function (...args) {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          callback.apply(this, args);
          rafId = null;
        });
      }
    };
  }

  document.querySelector('#display').ontouchend = function (event) {
    document.querySelector('#display').classList.remove('scrollNone');
    var endTime = Date.now();
    var duration = endTime - startTime;
    var shouldSwipe = false;
    if (choose_list_swiped) {
      clearTimeout(choose_list_swiped);
      choose_list_swiped = null;
    }

    currentX = event.changedTouches[0].clientX;
    currentY = event.changedTouches[0].clientY;
    deltaX = currentX - startX;
    deltaY = currentY - startY;

    document.querySelector('.main_chat_window').classList.remove('swipe');
    document.querySelector('.choose_list').classList.remove('swipe');

    if (isSwiping && deltaX > 0) {
      if (duration <= velocityThreshold) {
        shouldSwipe = true;
      } else if (deltaX > swipeThreshold) {
        shouldSwipe = true;
      }

      if (shouldSwipe) {
        if (choose_list_swiped) {
          clearTimeout(choose_list_swiped);
        }

        sender_ajax.abort();
        window.history.replaceState(null, null, `#${0}`);
        hashChange();
      } else {
        if (choose_list_swiped) {
          clearTimeout(choose_list_swiped);
        }

        choose_list_swiped = setTimeout(function () {
          document.querySelector('.choose_list').classList.add('swiped');
          choose_list_swiped = null;
        }, 350);
      }
    }

    document
      .querySelector('#display')
      .addEventListener('touchmove', throttleWithRAF(handleSwipeDirection), {
        passive: false,
      });
    isSwiping = false;
  };

  function handleSwipeDirection(event) {
    if (
      !document.querySelector('.main_chat_window').classList.contains('swipe')
    )
      return;

    currentX = event.changedTouches[0].clientX;
    currentY = event.changedTouches[0].clientY;
    deltaX = currentX - startX;
    deltaY = currentY - startY;
    if (!isSwiping) {
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        isSwiping = true;
        document.querySelector('#display').classList.add('swipe');
        startX = currentX;
        startY = currentY;
        deltaX = 0;
        deltaY = 0;
      } else if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
        document.querySelector('.main_chat_window').classList.remove('swipe');
        return;
      }
    }

    if (isSwiping) {
      if (event.cancelable) event.preventDefault();
      document.querySelector('#display').classList.add('scrollNone');
      document.querySelector('.choose_list').classList.remove('swiped');
      textareaElement.blur();
      document.documentElement.style.setProperty(
        '--swipe-margin',
        `${Math.max(0, deltaX)}px`
      );
    }
  }

  // document.querySelector('#display').onscroll = throttle(function (event) {
  //   // document.querySelector('.display_clone').scrollTop =
  //   //   event.target.scrollTop +
  //   //   window.innerHeight -
  //   //   opponent_title_name_height -
  //   //   send_div_height;
  // }, 50); // ~60fps

  //   function rafThrottle(func) {
  //     let isRunning = false;

  //     return function (...args) {
  //       if (!isRunning) {
  //         isRunning = true;
  //         requestAnimationFrame(() => {
  //           func.apply(this, args);
  //           isRunning = false;
  //         });
  //       }
  //     };
  //   }

  //   document.querySelector('#display').onscroll = rafThrottle(function (event) {
  //     document.querySelector('.display_clone').scrollTop =
  //       event.target.scrollTop + window.innerHeight - 170;
  //   });

  //   document.querySelector('.overflow-visible-scroll').onscroll = function (
  //     event
  //   ) {
  //     document.querySelector('.overflow-display').style.minHeight = `${
  //       document.querySelector('#display').scrollHeight + 100
  //     }px`;
  //     document.querySelector('#display').scrollTop = event.target.scrollTop;

  //   };

  document.querySelector('.choose_list').onscroll = function (event) {
    document
      .querySelector('.shadow-header')
      .style.setProperty(
        '--shadow-header',
        Math.max(Math.min(event.target.scrollTop, 50), 25) + 'px'
      );
  };

  //   document.addEventListener('scroll', (e) => {
  //     if (document.documentElement.scrollTop > 0) {
  //       document.documentElement.scrollTop = 0;
  //     }
  //   });
  //   let send_div_height_focus_var = 0;
  //   document.querySelector('.search_div').addEventListener('touchstart', (e) => {
  //     this.focus();
  //   });
  function scrollWindowToZero() {
    // window.scrollTo(0, 0);
  }

  //   let fullWindowHeight = window.innerHeight;
  let send_div_height_focus_var = 0;
  function viewportResize(event) {
    // Declare variables properly
    const fullWindowHeight = window.innerHeight;
    send_div_height_focus_var = event
      ? fullWindowHeight - event.target.height
      : 0;

    const isChrome =
      navigator.userAgent.indexOf('Chrome') > -1 &&
      navigator.userAgent.indexOf('Edge') == -1;
    const isAndroid = navigator.userAgent.indexOf('Android') > -1;

    const search_div_height_focus_var = event
      ? fullWindowHeight -
        event.target.height +
        (isAndroid && isChrome ? 90 : 0)
      : 0;

    document.removeEventListener('scroll', scrollWindowToZero);

    document.addEventListener('scroll', scrollWindowToZero);

    const searchDiv = document.querySelector('.search_div');
    if (searchDiv) {
      searchDiv.style.setProperty(
        '--search_div_height_focus',
        `${search_div_height_focus_var}px`
      );
    }

    document.documentElement.style.setProperty(
      '--send_div_height_focus',
      `${send_div_height_focus_var}px`
    );
    setTimeout(() => {
      const safeAreaBottom = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sat') ||
          getComputedStyle(document.documentElement).getPropertyValue(
            '--sab'
          ) ||
          0
      );

      const roomDiv = document.querySelector('.room_div');
      const textarea = document.querySelector('.textarea');

      if (roomDiv && textarea && $(textarea).is(':focus')) {
        // Проверяем, находится ли пользователь near the bottom
        const isNearBottom =
          roomDiv.scrollHeight - roomDiv.scrollTop - roomDiv.clientHeight < 100;

        // Скроллим только если пользователь near the bottom
        if (isNearBottom) {
          roomDiv.scrollBy({
            top: send_div_height_focus_var + safeAreaBottom,
            behavior: 'smooth',
          });
        }
      }
    }, 0);
  }

  document.querySelector('.search_field_div').onmousedown = function (e) {
    e.preventDefault();
    document.querySelector('.search_field').focus();
  };

  setTimeout(viewportResize, 100);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', viewportResize);
  }

  const textareaElement = document.querySelector('.textarea');
  let textareaLongPress = false;
  let textareaLongPressTimeout = null;

  textareaElement.ontouchstart = async function () {
    textareaLongPressTimeout = setTimeout(() => {
      textareaLongPress = true;
    }, 1000);
  };

  textareaElement.addEventListener('focus', async (e) => {
    // if (textareaLongPress) {
    //   const textArea = this;
    //   try {
    //     const clipboardText = await navigator.clipboard.readText();
    //     textArea.value = clipboardText;
    //   } catch (err) {
    //     console.error('Failed to read clipboard:', err);
    //   }
    //   clearTimeout(textareaLongPressTimeout);
    //   textareaLongPress = false;
    // }
    document.querySelector('.room_div').classList.add('focus');
  });

  textareaElement.addEventListener('blur', (e) => {
    document.querySelector('.room_div').classList.remove('focus');
  });

  const CURRENT_VERSION = '1.3.5    ';
  const lastVersion = localStorage.getItem('app_version');

  if (lastVersion && lastVersion !== CURRENT_VERSION) {
    showUpdateNotification();
    localStorage.setItem('app_version', CURRENT_VERSION);
  } else {
    localStorage.setItem('app_version', CURRENT_VERSION);
  }

  function showUpdateNotification() {
    if (confirm('Click "OK" to update the app')) {
      location.reload();
    }
  }

  if (
    window.location.hash.slice(1) == '' ||
    window.location.hash.slice(1) == '0'
  ) {
    document.querySelector('#post-form').classList.add('hidden');
    document.querySelector('#opponent_title_name').classList.add('hidden');
  }

  // document.getElementsByTagName('html')[0].style.overflow = 'hidden';
  // document.getElementsByTagName('body')[0].style.overflow = 'hidden';
  // document.getElementsByTagName('html')[0].style.touchAction = 'none';
  // document.getElementsByTagName('body')[0].style.userSelect = 'none';

  $.ajax({
    type: 'GET',
    url: '/get_general_info',
    success: function (data) {
      document.querySelector('#username').value = data.user[0].id;
      document.querySelector('#username_id').value = data.user[0].id;

      if (data.user[0].image == '') {
        avatar = document.createElement('div');
        name = data.user[0].username;
        if (name != null) var letter = name.substr(0, 1).toUpperCase();
        else var letter = '';
        avatar.innerHTML = letter;

        if (name.lastIndexOf(' ') != -1) {
          var letter_2 = name
            .substr(name.lastIndexOf(' ') + 1, 1)
            .toUpperCase();
          avatar.innerHTML += letter_2;
        }

        var backgroundColor = stringToColor(name);
        avatar.style.backgroundColor = backgroundColor;
        avatar.setAttribute(
          'style',
          'background: linear-gradient(0deg, ' +
            pSBC(-0.6, backgroundColor) +
            ' 0%, ' +
            pSBC(-0.4, backgroundColor) +
            ' 35%, ' +
            backgroundColor +
            ' 100%);'
        );
        avatar.setAttribute('id', 'user-info-avatar_settings_menu');
      } else {
        avatar = document.createElement('img');
        avatar.src =
          '//' + window.location.host + '/media/' + data.user[0].image.slice(6);
        avatar.setAttribute('id', 'avatar_profile_settings_menu');
      }

      document
        .querySelector('#user_avatar_settings_menu_image')
        .appendChild(avatar);
      document.querySelector('.dropbtn').appendChild(avatar.cloneNode(true));
      document.querySelector('#username_settings_menu').textContent =
        data.user[0].username;

      document.querySelector('#user_settings_div').textContent =
        data.user[0].username;
      document.querySelector('#user_settings_email_div').textContent =
        data.user[0].email;

      //   document
      //     .querySelector('#user_settings_image_div')
      //     .appendChild(avatar.cloneNode(true));

      function connect_user() {
        let url_user = `${ws_protocol}${
          window.location.host
        }/socket-server/user/${document.querySelector('#username_id').value}/`;
        chatSocket_user = new WebSocket(url_user);

        chatSocket_user.onopen = function (e) {};

        chatSocket_user.onmessage = function (e) {
          let data = JSON.parse(e.data);
          if (data.type == 'create_new_room') {
            var chat_counter = 0;
            chat = [data.room];
            for (item in chat) {
              var users_list = document.createElement('form');
              var avatar = document.createElement('div');
              avatar.setAttribute('class', 'user-info-avatar');
              var opponent_ind = 0;

              if (chat[item].room_type == 'G' || chat[item].room_type == 'C') {
                if (chat[item].image != null) {
                  avatar = document.createElement('img');
                  avatar.src =
                    '//' +
                    window.location.host +
                    '/media/' +
                    chat[item].image.slice(12);
                  avatar.setAttribute('class', 'avatar_profile');
                }
                opponent = chat[item].name;
              }

              if (chat[item].room_type == 'D') {
                if (
                  chat[item].users[0].id ==
                  document.querySelector('#username_id').value
                )
                  opponent_ind = 1;
                else opponent_ind = 0;

                opponent = chat[item].users[opponent_ind].username;

                if (chat[item].users[opponent_ind].image != null) {
                  avatar = document.createElement('img');
                  avatar.src =
                    '//' +
                    window.location.host +
                    '/media/' +
                    chat[item].users[opponent_ind].image.slice(12);
                  avatar.setAttribute('class', 'avatar_profile');
                }
              }

              var user_contact_id = document.createElement('input');
              var user_contact_name = document.createElement('div');

              var last_message = document.createElement('div');
              var username_and_last_message = document.createElement('div');
              username_and_last_message.setAttribute(
                'class',
                'username_and_last_message'
              );
              var csrf = document.createElement('input');
              var csrfToken = document.getElementsByName(
                'csrfmiddlewaretoken'
              )[0].value;
              var unread_counter = document.createElement('div');

              last_message.setAttribute('class', 'room_last_message');

              csrf.setAttribute('type', 'hidden');
              csrf.setAttribute('name', 'csrfmiddlewaretoken');
              csrf.setAttribute('value', csrfToken);
              csrf.setAttribute('style', 'display: none');

              if (
                chat[item].users[opponent_ind].image == null &&
                chat[item].image == null
              ) {
                if (chat[item].room_type == 'D')
                  name = chat[item].users[opponent_ind].username;
                if (chat[item].room_type == 'G' || chat[item].room_type == 'C')
                  name = chat[item].name;

                if (name != null) var letter = name.substr(0, 1).toUpperCase();
                else var letter = '';
                avatar.innerHTML = letter;

                if (name.lastIndexOf(' ') != -1) {
                  var letter_2 = name
                    .substr(name.lastIndexOf(' ') + 1, 1)
                    .toUpperCase();
                  avatar.innerHTML += letter_2;
                }

                var backgroundColor = stringToColor(name);
                avatar.style.backgroundColor = backgroundColor;
                avatar.setAttribute(
                  'style',
                  'background: linear-gradient(0deg, ' +
                    pSBC(-0.6, backgroundColor) +
                    ' 0%, ' +
                    pSBC(-0.4, backgroundColor) +
                    ' 35%, ' +
                    backgroundColor +
                    ' 100%);'
                );
              }

              user_contact_id.value = chat[item].id;
              user_contact_id.setAttribute('type', 'hidden');
              user_contact_id.setAttribute('name', 'chats');
              user_contact_id.setAttribute('style', 'display: none');

              users_list.setAttribute('method', 'POST');
              users_list.setAttribute('class', 'users_full_form');
              users_list.setAttribute('name', 'form-submit-users');

              user_contact_name.textContent = opponent;
              user_contact_name.setAttribute('class', 'users');

              username_and_last_message.appendChild(user_contact_name);
              username_and_last_message.appendChild(last_message);

              users_list.appendChild(avatar);
              users_list.appendChild(csrf);
              users_list.appendChild(user_contact_id);
              users_list.appendChild(username_and_last_message);

              document.querySelector('.users_search').prepend(users_list);

              room_list[user_contact_id.value] = users_list;
              list = document.querySelector('.users_search');

              users_list_contact = users_list.cloneNode(true);

              create_new_group_choose = document.createElement('div');
              create_new_group_choose.setAttribute(
                'class',
                'create_new_group_choose'
              );
              create_new_group_choose_check = document.createElement('input');
              create_new_group_choose_check.type = 'checkbox';
              create_new_group_choose.appendChild(
                create_new_group_choose_check
              );

              users_list_contact.prepend(create_new_group_choose);
              document
                .querySelector('.all_my_contacts')
                .append(users_list_contact);

              users_list.onmousedown = function (event) {
                event.preventDefault();

                if (room != this.getElementsByTagName('input')[1].value) {
                  //                                document.querySelector("#select_chat_to_start").style.display = "none";
                  block_date_dict = [];
                  sender_ajax.abort();
                  document.querySelector('#room_id').value =
                    this.getElementsByTagName('input')[1].value;
                  document.querySelector('#name').value =
                    this.querySelector('.chat_name').textContent;
                  document
                    .querySelectorAll('.users_full_form')
                    .forEach(function (e) {
                      e.classList.remove('active');
                    });
                  this.classList.add('active');
                  //   window.location.hash =
                  //     document.querySelector('#room_id').value;
                  room = document.querySelector('#room_id').value;
                  window.history.replaceState(null, null, `#${room}`);
                  hashChange();

                  check_redirect = 0;
                  load_check = 1;
                  load_photo_check = 0;
                  $('#display').empty();
                  $('#attachment_videos').empty();
                  $('#attachment_photos').empty();
                  $('#attachment_files').empty();
                  $('#attachment_music').empty();
                  $('#attachment_links').empty();
                  sender();
                  adapt();
                  check_new_mes = '';
                  avatar_attachments = this.firstChild.cloneNode(true);

                  avatar_attachments_username = document.createElement('div');
                  avatar_attachments_username.setAttribute(
                    'id',
                    'avatar_attachments_username'
                  );

                  opponent_username_attachment = document.createElement('div');
                  opponent_username_attachment.textContent =
                    document.querySelector('#name').value;
                  opponent_username_attachment.setAttribute(
                    'id',
                    'avatar_attachments_username'
                  );
                  avatar_attachments_username.appendChild(
                    opponent_username_attachment
                  );

                  $('#opponent_photo_avatar').empty();
                  document
                    .querySelector('#opponent_photo_avatar')
                    .appendChild(avatar_attachments_username);
                  document
                    .querySelector('#opponent_photo_avatar')
                    .appendChild(avatar_attachments);
                  if (avatar_attachments.classList.contains('user-info-avatar'))
                    avatar_attachments.setAttribute(
                      'class',
                      'user-info-avatar_attachments'
                    );
                  if (avatar_attachments.classList.contains('avatar_profile')) {
                    avatar_attachments.setAttribute(
                      'class',
                      'avatar_profile_attachments'
                    );
                    shadow = document.createElement('div');
                    shadow.setAttribute('id', 'attachment_avatar_shadow');
                    document
                      .querySelector('#opponent_photo_avatar')
                      .appendChild(shadow);
                  }
                } else
                  document.querySelector('#display').scrollTo({
                    top: document.querySelector('#display').scrollHeight,
                    behavior: 'smooth',
                  });
              };

              //                        if(chat[item].users[0].id == document.querySelector("#username_id").value){
              //                            window.location.hash = chat[item].users[0].id;
              $(users_list).mousedown();
              //                        }

              if (list.getElementsByTagName('form')[chat_counter] != undefined)
                //                                chatSocket[user_contact_id.value] = new WebSocket(url);

                //                                chatSocket[user_contact_id.value].onclose = function(e){
                //
                //                                        number_of_room = this.url.slice(this.url.indexOf("socket-server")+14, this.url.lastIndexOf("/"));
                ////                                        this = "new WebSocket(this.url)";
                ////                                        let url = `${ws_protocol}${window.location.host}/socket-server/${number_of_room}/`;
                ////                                        e = new WebSocket(url);
                //
                //
                //                                }

                connect_socket(user_contact_id.value);

              ++chat_counter;
            }
          }
          if (data.type == 'search_users') {
            document
              .querySelectorAll('.users_full_form.search')
              .forEach(function (e) {
                e.remove();
              });

            search_new_user = JSON.parse(JSON.parse(e.data).search);

            var chat_counter = 0;
            chat = search_new_user;
            for (item in chat) {
              if (
                chat[item].id != document.querySelector('#username_id').value
              ) {
                var users_list = document.createElement('form');
                var avatar = document.createElement('div');
                avatar.setAttribute('class', 'user-info-avatar');
                var opponent_ind = 0;

                if (chat[item].image != '') {
                  avatar = document.createElement('img');
                  avatar.src =
                    '//' +
                    window.location.host +
                    '/media/' +
                    chat[item].image.slice(12);
                  avatar.setAttribute('class', 'avatar_profile');
                }
                opponent = chat[item].username;

                var user_contact_id = document.createElement('input');
                var user_contact_name = document.createElement('div');

                var last_message = document.createElement('div');
                var username_and_last_message = document.createElement('div');
                username_and_last_message.setAttribute(
                  'class',
                  'username_and_last_message'
                );
                var csrf = document.createElement('input');
                var csrfToken = document.getElementsByName(
                  'csrfmiddlewaretoken'
                )[0].value;
                var unread_counter = document.createElement('div');

                //                        unread_messages_counter = 0;
                //                        for(viewed in response.all_chats[item].room){
                //                            if(!response.all_chats[item].room[viewed].viewed.includes(response.my_user) && response.all_chats[item].room[viewed].user != response.my_user)
                //                                ++unread_messages_counter;
                //                        }

                //                        for(all_messages_list = response.messages.length-1; all_messages_list >= 0; --all_messages_list){
                //                            if(response.messages[all_messages_list].room == response.all_chats[item].id){
                //                                if(response.messages[all_messages_list].value != "") last_message.innerHTML = txtdecode(response.messages[all_messages_list].value, "1234");
                //                                break;
                //                            }
                //                        }

                last_message.setAttribute('class', 'room_last_message');

                csrf.setAttribute('type', 'hidden');
                csrf.setAttribute('name', 'csrfmiddlewaretoken');
                csrf.setAttribute('value', csrfToken);
                csrf.setAttribute('style', 'display: none');

                if (chat[item].image == '') {
                  name = chat[item].username;

                  if (name != null)
                    var letter = name.substr(0, 1).toUpperCase();
                  else var letter = '';
                  avatar.innerHTML = letter;

                  if (name.lastIndexOf(' ') != -1) {
                    var letter_2 = name
                      .substr(name.lastIndexOf(' ') + 1, 1)
                      .toUpperCase();
                    avatar.innerHTML += letter_2;
                  }

                  var backgroundColor = stringToColor(name);
                  avatar.style.backgroundColor = backgroundColor;
                  avatar.setAttribute(
                    'style',
                    'background: linear-gradient(0deg, ' +
                      pSBC(-0.6, backgroundColor) +
                      ' 0%, ' +
                      pSBC(-0.4, backgroundColor) +
                      ' 35%, ' +
                      backgroundColor +
                      ' 100%);'
                  );
                }

                user_contact_id.value = chat[item].id;
                user_contact_id.setAttribute('type', 'hidden');
                user_contact_id.setAttribute('name', 'users');
                user_contact_id.setAttribute('style', 'display: none');

                users_list.setAttribute('method', 'POST');
                users_list.setAttribute('class', 'users_full_form search');
                users_list.setAttribute('name', 'form-submit-users');

                user_contact_name.textContent = opponent;
                user_contact_name.setAttribute('class', 'users');

                username_and_last_message.appendChild(user_contact_name);
                username_and_last_message.appendChild(last_message);

                //                        unread_counter.textContent = unread_messages_counter;
                //                        unread_counter.setAttribute("class", "rooms_list_unread_counter");

                users_list.appendChild(avatar);
                users_list.appendChild(csrf);
                users_list.appendChild(user_contact_id);
                users_list.appendChild(username_and_last_message);
                //                        users_list.appendChild(unread_counter);
                document.querySelector('.users_search').append(users_list);

                room_list[user_contact_id.value] = users_list;
                list = document.querySelector('.users_search');

                users_list.onmousedown = function (event) {
                  document.querySelector('.search_field').value = '';
                  document.documentElement.style.setProperty(
                    '--rooms_display',
                    `flex`
                  );
                  document
                    .querySelectorAll('.users_full_form.search')
                    .forEach(function (e) {
                      e.remove();
                    });

                  formData = new FormData(this);
                  //formData.append("room_type", "D");
                  //formData.append("contacts_id", JSON.stringify([chat[item].id, document.querySelector("#username_id").value]));

                  $.ajax({
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    url: '/checkview_users',
                    data: formData,
                    success: function (response) {
                      create_new_group_list_contacts = [
                        chat[item].id,
                        document.querySelector('#username_id').value,
                      ];
                      for (
                        contact = 0;
                        contact < create_new_group_list_contacts.length;
                        ++contact
                      ) {
                        (async () => {
                          const contact_ = contact;
                          url_contact = `${ws_protocol}${window.location.host}/socket-server/user/${create_new_group_list_contacts[contact]}/`;
                          chatSocket_contact = new WebSocket(await url_contact);

                          chatSocket_contact.onopen = function () {
                            this.send(
                              JSON.stringify({
                                type: 'create_new_room',
                                room_id: response.id,
                              })
                            );
                            forcibly_close_the_socket = true;
                            this.close();
                          };
                        })();
                      }
                    },
                  });
                  event.preventDefault();
                  if (room != this.getElementsByTagName('input')[1].value) {
                    //                                document.querySelector("#select_chat_to_start").style.display = "none";
                    //                                document.querySelector(".send_div").style.display = "none";
                    block_date_dict = [];
                    sender_ajax.abort();
                    document.querySelector('#room_id').value =
                      this.getElementsByTagName('input')[1].value;
                    document.querySelector('#name').value =
                      this.querySelector('.chat_name').textContent;
                    document
                      .querySelectorAll('.users_full_form')
                      .forEach(function (e) {
                        e.classList.remove('active');
                      });
                    this.classList.add('active');
                    window.location.hash =
                      document.querySelector('#room_id').value;
                    room = document.querySelector('#room_id').value;

                    check_redirect = 0;
                    load_check = 1;
                    load_photo_check = 0;
                    $('#display').empty();
                    $('#attachment_videos').empty();
                    $('#attachment_photos').empty();
                    $('#attachment_files').empty();
                    $('#attachment_music').empty();
                    $('#attachment_links').empty();
                    adapt();
                    check_new_mes = '';
                    avatar_attachments = this.firstChild.cloneNode(true);

                    avatar_attachments_username = document.createElement('div');
                    avatar_attachments_username.setAttribute(
                      'id',
                      'avatar_attachments_username'
                    );

                    opponent_username_attachment =
                      document.createElement('div');
                    opponent_username_attachment.textContent =
                      document.querySelector('#name').value;
                    opponent_username_attachment.setAttribute(
                      'id',
                      'avatar_attachments_username'
                    );
                    avatar_attachments_username.appendChild(
                      opponent_username_attachment
                    );

                    $('#opponent_photo_avatar').empty();
                    document
                      .querySelector('#opponent_photo_avatar')
                      .appendChild(avatar_attachments_username);
                    document
                      .querySelector('#opponent_photo_avatar')
                      .appendChild(avatar_attachments);
                    if (
                      avatar_attachments.classList.contains('user-info-avatar')
                    )
                      avatar_attachments.setAttribute(
                        'class',
                        'user-info-avatar_attachments'
                      );
                    if (
                      avatar_attachments.classList.contains('avatar_profile')
                    ) {
                      avatar_attachments.setAttribute(
                        'class',
                        'avatar_profile_attachments'
                      );
                      shadow = document.createElement('div');
                      shadow.setAttribute('id', 'attachment_avatar_shadow');
                      document
                        .querySelector('#opponent_photo_avatar')
                        .appendChild(shadow);
                    }
                  } else
                    document.querySelector('#display').scrollTo({
                      top: document.querySelector('#display').scrollHeight,
                      behavior: 'smooth',
                    });
                };

                //                        if(user_contact_id.value == window.location.hash.slice(1)) $(list.getElementsByTagName('form')[chat_counter]).mousedown();

                if (
                  list.getElementsByTagName('form')[chat_counter] != undefined
                )
                  //                                chatSocket[user_contact_id.value] = new WebSocket(url);

                  //                                chatSocket[user_contact_id.value].onclose = function(e){
                  //
                  //                                        number_of_room = this.url.slice(this.url.indexOf("socket-server")+14, this.url.lastIndexOf("/"));
                  ////                                        this = "new WebSocket(this.url)";
                  ////                                        let url = `${ws_protocol}${window.location.host}/socket-server/${number_of_room}/`;
                  ////                                        e = new WebSocket(url);
                  //
                  //
                  //                                }

                  connect_socket(user_contact_id.value);

                ++chat_counter;
              }
            }
          }
        };

        chatSocket_user.onclose = function (e) {
          console.log(e.code);
          console.log(
            'Socket is closed. Reconnect will be attempted in 0.1 second.',
            e
          );
          setTimeout(function () {
            connect_user();
          }, 100);
        };

        chatSocket_user.onerror = function (err) {
          console.error(
            'Socket encountered error: ',
            err.message,
            'Closing socket'
          );
          chatSocket_user.close();
        };
      }

      connect_user();
    },
  });

  if (document.querySelector('#room_id').value == 0) {
    //        document.querySelector("#opponent_title_name").setAttribute('style','display: none');
    //        document.querySelector(".send_div").setAttribute('style','display: none');
    //        if(window.screen.availWidth <= 576) document.querySelector(".main_chat_window").setAttribute('style','display: none');
  } else {
    document.querySelector('#opponent_title_name').classList.remove('hidden');
    document.querySelector('.send_div').setAttribute('style', 'display: flex');
    // if (window.screen.availWidth <= 576) {
    //   document
    //     .querySelector('.choose_list')
    //     .setAttribute('style', 'display: none');
    //   document
    //     .querySelector('.main_chat_window')
    //     .setAttribute('style', 'width: 99vw');
    // }
  }

  //document.querySelector("#select_chat_to_start").style.opacity = 1;

  function connect_socket(number_of_room = 0) {
    let url = `${ws_protocol}${window.location.host}/socket-server/${number_of_room}/`;
    chatSocket[number_of_room] = new WebSocket(url);

    chatSocket[number_of_room].onopen = function () {};

    chatSocket[number_of_room].onmessage = function (e) {
      let data = JSON.parse(e.data);
      if (data.type == 'chat_message') {
        // if (data.data.id != all_data_rooms[data.room_id].messages.at(-1).id) {
        all_data_rooms[data.room_id].messages.push(data.data);
        message_initialization(all_data_rooms[data.room_id], true);
        // }
        room_last_message = txtdecode(data.data.value, '1234');
        if (data.data.value != '')
          room_list[data.room_id].querySelector(
            '.room_last_message'
          ).textContent = room_last_message;
        if (
          data.data.user !=
          parseInt(document.querySelector('#username_id').value)
        ) {
          if (isSupported && Notification.permission === 'granted') {
            notification = new Notification(
              room_list[data.room_id].querySelector('.chat_name').textContent,
              {
                body: room_last_message,
                icon: '/static/Images/main_site_icon.png',
              }
            );
          }
        }
      }
      if (data.type == 'message_reaction') {
        mes_reaction(data.message_id);
      }
      if (data.type == 'message_viewed') {
        mes_viewed(data.message_id);
      }
    };

    chatSocket[number_of_room].onclose = function (e) {
      number_of_room = this.url.slice(
        this.url.indexOf('socket-server') + 14,
        this.url.lastIndexOf('/')
      );
      setTimeout(function () {
        connect_socket(number_of_room);
      }, 100);
    };

    chatSocket[number_of_room].onerror = function (err) {
      chatSocket[number_of_room].close();
    };
  }

  $(document).ready(getContacts);

  function getContacts() {
    $.ajax({
      type: 'GET',
      url: '/getContacts/',
      success: function (response) {
        getContacts_response(response);
      },
    });
  }

  function getContacts_response(response) {
    var contacts_counter = 0;
    my_user = response.my_user;
    for (contact in response.all_chats) {
      if (response.all_chats[contact].users[0].id == my_user)
        contact_user = response.all_chats[contact].users[1];
      else contact_user = response.all_chats[contact].users[0];

      var users_list = document.createElement('div');
      var user_contact_id = document.createElement('input');
      var user_contact_name = document.createElement('div');

      if (contact_user.image != null) {
        var avatar = document.createElement('img');
        avatar.setAttribute('class', 'avatar_profile');
      } else {
        var avatar = document.createElement('div');
        avatar.setAttribute('class', 'user-info-avatar');
      }

      if (contact_user.image != null)
        avatar.src = '//' + window.location.host + contact_user.image.slice(6);
      else {
        var name = contact_user.username;
        var letter = name.substr(0, 1).toUpperCase();
        avatar.innerHTML = letter;
        if (name.indexOf(' ') != -1) {
          var letter_2 = name.substr(name.indexOf(' ') + 1, 1).toUpperCase();
          avatar.innerHTML += letter_2;
        }

        var backgroundColor = stringToColor(name);
        avatar.style.backgroundColor = backgroundColor;
        avatar.setAttribute(
          'style',
          'background: linear-gradient(0deg, ' +
            pSBC(-0.6, backgroundColor) +
            ' 0%, ' +
            pSBC(-0.4, backgroundColor) +
            ' 35%, ' +
            backgroundColor +
            ' 100%);'
        );
      }

      user_contact_id.value = contact_user.id;
      user_contact_id.setAttribute('type', 'hidden');
      user_contact_id.setAttribute('name', 'users');
      user_contact_id.setAttribute('style', 'display: none');

      users_list.setAttribute('method', 'POST');
      users_list.setAttribute('action', 'checkview_users');
      users_list.setAttribute('class', 'users_full_form');
      users_list.setAttribute('name', 'form-submit-users');

      user_contact_name.innerHTML = contact_user.username;
      user_contact_name.setAttribute('class', 'users');

      users_list.appendChild(avatar);
      users_list.appendChild(user_contact_id);
      users_list.appendChild(user_contact_name);

      create_new_group_choose = document.createElement('div');
      create_new_group_choose.setAttribute('class', 'create_new_group_choose');
      create_new_group_choose_check = document.createElement('input');
      create_new_group_choose_check.type = 'checkbox';
      create_new_group_choose.appendChild(create_new_group_choose_check);

      users_list.prepend(create_new_group_choose);
      document.querySelector('.all_my_contacts').append(users_list);
      list_create_group = document.querySelector('.all_my_contacts');

      users_list.onclick = function (event) {
        this.querySelector('.create_new_group_choose').getElementsByTagName(
          'input'
        )[0].checked = true;
        //                            event.preventDefault();
        //                            if(room != this.getElementsByTagName("input")[1].value){
        //
        //                                sender_ajax.abort();
        //                                document.querySelector("#room_id").value = this.getElementsByTagName("input")[1].value;
        //                                document.querySelector("#name").value = this.querySelector('.users').textContent;
        //                                document.querySelectorAll(".users_full_form").forEach(function(e){ e.classList.remove("active")});
        //                                this.classList.add("active");
        //                                window.location.hash = document.querySelector("#room_id").value;
        //                                room = document.querySelector("#room_id").value;
        //                                if(typeof chatSocket_current != "undefined"){
        //                                    chatSocket_current.close();
        //                                }
        //                                let url = `${ws_protocol}${window.location.host}/socket-server/${room}/`;
        //                                chatSocket_current = new WebSocket(url);
        //
        //
        //                                chatSocket_current.onmessage = function(e){
        //                                    let data = JSON.parse(e.data)
        //                                    if(data.type == 'chat_message'){
        //                                        sender();
        //                                        room_list[data.room_id].querySelector(".room_last_message").textContent = txtdecode(data.message_text,"1234");
        //                                    }
        ////                                    if(data.type == 'message_viewed'){
        ////                                        mes_viewed(data.message_id);
        ////                                    }
        ////                                    if(data.type == 'message_reaction'){
        ////                                        mes_reaction(data.message_id);
        ////                                    }
        //                                }
        //
        //
        //                                check_redirect = 0;
        //                                load_check = 1;
        //                                load_photo_check = 0;
        //                                $("#display").empty();
        //                                $("#attachment_videos").empty();
        //                                $("#attachment_photos").empty();
        //                                $("#attachment_files").empty();
        //                                $("#attachment_music").empty();
        //                                $("#attachment_links").empty();
        //                                sender();
        //                                adapt();
        //                                check_new_mes = "";
        //                            }
      };

      ++contacts_counter;
    }
  }

  /*window.onbeforeunload = function(){

}*/
  function lastMessageDateFormat(date) {
    var inputDate = new Date(date);
    var now = new Date();

    // Разница в миллисекундах
    var diffMs = now - inputDate;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Время в формате HH:MM AM/PM
    var hours = inputDate.getHours();
    var minutes = inputDate.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    // Сегодня
    if (diffDays === 0) {
      return strTime;
    }

    if (diffDays === 1) {
      return strTime;
    }

    if (diffDays < 7) {
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[inputDate.getDay()];
    }

    if (inputDate.getFullYear() === now.getFullYear()) {
      var day = inputDate.getDate();
      var month = inputDate.getMonth() + 1;
      return (month < 10 ? '0' + month : month) + '/' + day;
    }

    var day = inputDate.getDate();
    var month = inputDate.getMonth() + 1;
    var year = inputDate.getFullYear().toString().slice(-2);
    return (month < 10 ? '0' + month : month) + '/' + day + '/' + year;
  }

  function getUsers(substring) {
    chatSocket_user.send(
      JSON.stringify({
        type: 'search_users',
        search_substring: substring,
      })
    );
  }

  room_list = [];
  $(document).ready(getRooms);

  function getRooms() {
    $.ajax({
      type: 'GET',
      url: '/getChats/',
      success: function (response) {
        $('.users_search').empty();
        var chat_counter = 0;
        chat = response.all_chats;

        const promises = [];
        for (const id in chat) {
          promises.push(sender(chat[id].id));
        }

        Promise.all(promises)
          .then(() => {
            createChatUI(chat, response, chat_counter);
          })
          .catch((error) => {
            console.error('Error in sender promises:', error);
            createChatUI(chat, response, chat_counter);
          });
      },
    });
  }

  function createChatUI(chat, response, chat_counter) {
    for (item in chat) {
      var users_list = document.createElement('form');
      var avatar = document.createElement('div');
      avatar.setAttribute('class', 'user-info-avatar');
      var opponent_ind = 0;

      if (chat[item].room_type == 'G' || chat[item].room_type == 'C') {
        if (chat[item].image != null) {
          avatar = document.createElement('img');
          avatar.src =
            '//' +
            window.location.host +
            '/media/' +
            chat[item].image.slice(12);
          avatar.setAttribute('class', 'avatar_profile');
        }
        opponent = chat[item].name;
      }

      if (chat[item].room_type == 'D') {
        if (chat[item].users[0].id == response.my_user) opponent_ind = 1;
        else opponent_ind = 0;

        opponent = chat[item].users[opponent_ind].username;

        if (chat[item].users[opponent_ind].image != null) {
          avatar.style.backgroundImage =
            'url(//' +
            window.location.host +
            '/media/' +
            chat[item].users[opponent_ind].image.slice(12) +
            ')';
        }
      }

      var user_contact_id = document.createElement('input');
      var user_contact_name = document.createElement('div');

      var last_message = document.createElement('div');
      var username_and_last_message = document.createElement('div');
      username_and_last_message.setAttribute(
        'class',
        'username_and_last_message'
      );
      var csrf = document.createElement('input');
      var csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0]
        .value;
      var unread_counter = document.createElement('div');

      last_message.setAttribute('class', 'room_last_message');

      csrf.setAttribute('type', 'hidden');
      csrf.setAttribute('name', 'csrfmiddlewaretoken');
      csrf.setAttribute('value', csrfToken);
      csrf.setAttribute('style', 'display: none');

      if (
        chat[item].users[opponent_ind].image == null &&
        chat[item].image == null
      ) {
        if (chat[item].room_type == 'D')
          name = chat[item].users[opponent_ind].username;
        if (chat[item].room_type == 'G' || chat[item].room_type == 'C')
          name = chat[item].name;

        if (name != null) var letter = name.substr(0, 1).toUpperCase();
        else var letter = '';
        avatar.innerHTML = letter;

        if (name.lastIndexOf(' ') != -1) {
          var letter_2 = name
            .substr(name.lastIndexOf(' ') + 1, 1)
            .toUpperCase();
          avatar.innerHTML += letter_2;
        }

        var backgroundColor = stringToColor(name);
        avatar.style.backgroundColor = backgroundColor;
        avatar.setAttribute(
          'style',
          'background: linear-gradient(0deg, ' +
            pSBC(-0.8, backgroundColor) +
            ' 0%, ' +
            pSBC(-0.6, backgroundColor) +
            ' 35%, ' +
            backgroundColor +
            ' 100%);'
        );
      }

      user_contact_id.value = chat[item].id;
      user_contact_id.setAttribute('type', 'hidden');
      user_contact_id.setAttribute('name', 'chats');
      user_contact_id.setAttribute('style', 'display: none');

      users_list.setAttribute('method', 'POST');
      users_list.setAttribute('class', 'users_full_form');
      users_list.setAttribute('name', 'form-submit-users');

      user_contact_name.setAttribute('class', 'users');

      username_and_last_message.appendChild(user_contact_name);
      username_and_last_message.appendChild(last_message);

      users_list.appendChild(avatar);
      users_list.appendChild(csrf);
      users_list.appendChild(user_contact_id);
      users_list.appendChild(username_and_last_message);
      document.querySelector('.users_search').append(users_list);

      room_list[user_contact_id.value] = users_list;
      list = document.querySelector('.users_search');

      const lastMsg =
        all_data_rooms[user_contact_id.value].messages[
          all_data_rooms[user_contact_id.value].messages.length - 1
        ];

      chatName = document.createElement('div');
      chatName.setAttribute('class', 'chat_name');
      chatName.textContent = opponent;
      user_contact_name.appendChild(chatName);

      if (lastMsg != '' && lastMsg != null && lastMsg != undefined) {
        const room_last_message = txtdecode(lastMsg.value, '1234');
        last_message.textContent = room_last_message;

        roomLastMessageDate = document.createElement('div');
        roomLastMessageDate.setAttribute('class', 'room_last_message_date');
        roomLastMessageDate.textContent = lastMessageDateFormat(lastMsg.date);
        user_contact_name.appendChild(roomLastMessageDate);
      }

      users_list.onmousedown = function chatOpen(event) {
        scroll_more = 0;

        event.preventDefault();
        document.documentElement.style.setProperty(
          '--swipe-margin-inactive',
          `0%`
        );
        document.documentElement.style.setProperty(
          '--swipe-margin-choose-list',
          `-33%`
        );

        if (choose_list_swiped) {
          clearTimeout(choose_list_swiped);
        }
        if (clearChatTimeOut) {
          clearTimeout(clearChatTimeOut);
        }

        choose_list_swiped = setTimeout(function () {
          document.querySelector('.choose_list').classList.add('swiped');
          choose_list_swiped = null;
        }, 350);
        if (room != this.getElementsByTagName('input')[1].value) {
          block_date_dict = [];
          sender_ajax.abort();
          document.querySelector('#room_id').value =
            this.getElementsByTagName('input')[1].value;
          document.querySelector('#name').textContent =
            this.querySelector('.chat_name').textContent;
          sourceElement = this.querySelector('.user-info-avatar');
          targetElement = document
            .querySelector('.opponent_photo_div')
            .querySelector('.user-info-avatar');
          if (sourceElement && targetElement) {
            clonedElement = sourceElement.cloneNode(true);
            targetElement.replaceWith(clonedElement);
          }
          document.querySelectorAll('.users_full_form').forEach(function (e) {
            e.classList.remove('active');
          });
          this.classList.add('active');
          room = document.querySelector('#room_id').value;

          window.history.replaceState(null, null, `#${room}`);
          hashChange();

          check_redirect = 0;
          load_check = 1;
          load_photo_check = 0;
          $('#display').empty();
          $('#attachment_videos').empty();
          $('#attachment_photos').empty();
          $('#attachment_files').empty();
          $('#attachment_music').empty();
          $('#attachment_links').empty();
          adapt();
          getRoomData();

          check_new_mes = '';
          avatar_attachments = this.firstChild.cloneNode(true);

          avatar_attachments_username = document.createElement('div');
          avatar_attachments_username.setAttribute(
            'id',
            'avatar_attachments_username'
          );

          opponent_username_attachment = document.createElement('div');
          opponent_username_attachment.textContent =
            document.querySelector('#name').value;
          opponent_username_attachment.setAttribute(
            'id',
            'avatar_attachments_username'
          );
          avatar_attachments_username.appendChild(opponent_username_attachment);

          $('#opponent_photo_avatar').empty();
          document
            .querySelector('#opponent_photo_avatar')
            .appendChild(avatar_attachments_username);
          document
            .querySelector('#opponent_photo_avatar')
            .appendChild(avatar_attachments);
          if (avatar_attachments.classList.contains('user-info-avatar'))
            avatar_attachments.setAttribute(
              'class',
              'user-info-avatar_attachments'
            );
          if (avatar_attachments.classList.contains('avatar_profile')) {
            avatar_attachments.setAttribute(
              'class',
              'avatar_profile_attachments'
            );
            shadow = document.createElement('div');
            shadow.setAttribute('id', 'attachment_avatar_shadow');
            document
              .querySelector('#opponent_photo_avatar')
              .appendChild(shadow);
          }
        } else
          document.querySelector('#display').scrollTo({
            top: document.querySelector('#display').scrollHeight,
            behavior: 'smooth',
          });
      };

      if (user_contact_id.value == window.location.hash.slice(1))
        $(list.getElementsByTagName('form')[chat_counter]).mousedown();
      if (list.getElementsByTagName('form')[chat_counter] != undefined)
        connect_socket(user_contact_id.value);

      ++chat_counter;
    }
  }

  function getRoomData() {
    message_initialization(all_data_rooms[room]);
  }

  function sender(room) {
    return new Promise((resolve, reject) => {
      ajax_url_sender = '/GetMessages/' + room + '/';

      $.ajax({
        type: 'GET',
        url: ajax_url_sender,
        success: function (response) {
          all_data_rooms[room] = response;
          resolve(response); // Resolve the promise when done
        },
        error: function (xhr, status, error) {
          console.error('Error in sender for room', room, error);
          reject(error); // Reject if there's an error
        },
      });
    });
  }

  function hashChange() {
    all_messages_dives = [];

    // e.preventDefault;
    if (
      window.location.hash.slice(1) != '0' &&
      window.location.hash.slice(1) != ''
    ) {
      // $(room_list[window.location.hash.slice(1)]).mousedown();
    } else {
      go_home_page_func();
    }
  }

  // window.onpopstate = function(event) {
  //     window.location.hash = "0";
  //     // go_home_page_func();
  // };

  check_new_mes = '';

  /*	setInterval(function check_mes_update(){
		$.ajax({
			type: 'GET',
			url: "/getMessages/" + window.location.hash.slice(1),
			success: function(response) {
				if(response.messages[response.messages.length-1].id != check_new_mes){
				    sender();
				    check_new_mes = response.messages[response.messages.length-1].id;
                }
			},
		});
	}, 1000);*/

  function mes_viewed(mes_viewed_id) {
    // all_data_rooms[room].messages[key].viewed.push(
    //   parseInt(document.querySelector('#username_id').value)
    // );
    for (counter = 0; counter < mes_viewed_id.length; ++counter) {
      if (
        document.querySelector('#username_id').value ==
        all_messages[mes_viewed_id[counter]]
          .querySelector('.message')
          .getAttribute('value')
      ) {
        all_messages[mes_viewed_id[counter]].querySelector(
          '#viewed_check'
        ).src =
          '//' +
          window.location.host +
          '/static/Images/dialogs_received@3x.png';
        unread_messages.delete(all_messages[mes_viewed_id[counter]]);
      }
    }
  }

  function mes_reaction(mes_react_id) {
    const msg = all_messages[mes_react_id];
    const reaction = msg.querySelector('#reaction_span');
    const particles = msg.querySelector('#stellar_particles');

    if (particles._animationTimer) {
      clearTimeout(particles._animationTimer);
    }
    if (particles._hideTimer) {
      clearTimeout(particles._hideTimer);
    }

    function updateFixedPosition() {
      const container = document.querySelector('.main_chat_window');
      const containerRect = container.getBoundingClientRect();
      const parentRect = reaction.getBoundingClientRect();

      const centerX =
        parentRect.left - containerRect.left + parentRect.width / 2;
      const centerY =
        parentRect.top - containerRect.top + parentRect.height / 2;

      particles.style.left = centerX - particles.offsetWidth / 2 + 'px';
      particles.style.top = centerY - particles.offsetHeight / 2 + 'px';
    }

    if (!reaction.classList.contains('active')) {
      reaction.classList.add('active');
      particles.style.display = 'block';

      document
        .querySelector('#display')
        .addEventListener('scroll', updateFixedPosition);
      window.addEventListener('resize', updateFixedPosition);
      updateFixedPosition();
      requestAnimationFrame(() => {
        particles.classList.add('active');
      });

      particles._animationTimer = setTimeout(() => {
        particles.classList.remove('active');

        particles._hideTimer = setTimeout(() => {
          particles.style.display = 'none';
          delete particles._animationTimer;
          delete particles._hideTimer;
        }, 500);
      }, 1500);
    } else {
      reaction.classList.remove('active');
      particles.classList.remove('active');

      particles._hideTimer = setTimeout(() => {
        particles.style.display = 'none';
        delete particles._hideTimer;
      }, 500);
    }
  }

  check_mes_update = 0;
  check_mes_update_file = 0;

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  //document.querySelector(".main_chat_window").appendChild(document.querySelector("#select_chat_to_start"));

  messages_response = null;
  scroll_more = 0;

  function message_initialization(response, new_message = false) {
    check_last_message_bar = false;
    document.querySelector('#opponent_title_name').classList.remove('hidden');
    document.querySelector('.send_div').style.display = 'flex';
    last_read = null;

    messages_response = response;
    messages = response.messages;

    var this_date = new Date();
    files_counter = -1;
    audio_array_index = 0;
    check_mes_update = Math.max(messages.length - scroll_more, 0);
    mes_amount = check_mes_update;

    if (mes_amount - scroll_more <= 0) {
      check_mes_update = -50;
    }
    if (new_message) {
      check_mes_update = messages.length;
      mes_amount = messages.length + 49;
    }
    let month = null;
    for (var key = check_mes_update - 1; key >= mes_amount - 50; --key) {
      // for (var key = messages.length - 1; key >= 0; --key) {
      if (!response.messages[key]) continue;
      block_date = document.createElement('div');
      if (
        month != null &&
        this_date.getMonth() + 1 != response.messages[key].date.slice(5, 7) &&
        (key == 0 ||
          (key > 0 &&
            response.messages[key].date.slice(5, 7) !=
              response.messages[key - 1].date.slice(5, 7)))
      ) {
        new_month_check = 1;
        block_month = document.createElement('div');
        block_month.innerHTML = months[month];
        block_month.setAttribute('class', 'block_date');
      } else new_month_check = 0;
      let temp = document.createElement('div');
      let message_div_temp = document.createElement('div');
      reaction_span = document.createElement('span');
      let all_files = '';
      var len = response.messages[key].value.length;
      var check_transfer = 0;
      var mes = '';
      var file_new_name = '';
      mes = response.messages[key].value;
      if (mes != '') mes = txtdecode(mes, '1234');
      mes = urlify(mes);
      counter_img = 0;
      var user_file = '';
      var user_file_additional = '';
      var xhr = new XMLHttpRequest();

      files_message = messages[key].file;
      for (
        var files_key = files_message.length - 1;
        files_key >= 0;
        --files_key
      ) {
        lastIndexOf_ =
          files_message[files_key].file.lastIndexOf('_') == -1
            ? files_message[files_key].file.lastIndexOf('.')
            : files_message[files_key].file.lastIndexOf('_');
        file_name = files_message[files_key].file.slice(
          files_message[files_key].file.indexOf('media') + 12,
          lastIndexOf_
        );
        file_new_name = decodeURIComponent(
          file_name.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&')
        );
        file_type_from_name = files_message[files_key].file.slice(
          files_message[files_key].file.lastIndexOf('.')
        );
        if (files_message[files_key].file != 'False') {
          user_file =
            '//' +
            window.location.host +
            files_message[files_key].file.slice(6);

          user_file_pres = document.createElement('div');
          let attach_file = document.createElement('span');
          var file_type = files_message[files_key].file
            .split('.')
            .pop()
            .toLowerCase();

          if (file_type == 'jpg' || file_type == 'png' || file_type == 'jpeg') {
            ++files_counter;
            (async () => {
              const files_cnt = files_counter;
              var img = document.createElement('img');
              img.setAttribute('class', 'mes_img lazy');
              img.setAttribute('loading', 'lazy');
              user_file_pres = img;

              attachment_photo = document.createElement('img');
              attachment_photo.setAttribute(
                'class',
                'mes_img attachment_photo lazy'
              );
              $('#attachment_photos').append(attachment_photo);

              const z = await fetch(user_file, {
                method: 'get',
                signal: signal,
              }).catch(function (err) {
                console.error(` Err: ${err}`);
              });
              const url = URL.createObjectURL(await z.blob());
              if (
                document.querySelector('#display').querySelectorAll('.mes_img')[
                  document
                    .querySelector('#display')
                    .querySelectorAll('.mes_img').length -
                    files_cnt -
                    1
                ] != undefined
              ) {
                document.querySelector('#display').querySelectorAll('.mes_img')[
                  files_cnt
                ].src = url;
                document
                  .querySelector('#attachment_photos')
                  .querySelectorAll('.attachment_photo')[files_cnt].src = url;

                var modal = document.getElementById('myModal');
                img_comment = document.getElementById('img_comment');
                var modalImg = document.getElementById('img01');
                var captionText = document.getElementById('caption');
                const attachment_photo = document
                  .querySelector('#attachment_photos')
                  .querySelectorAll('.attachment_photo')[
                  document
                    .querySelector('#attachment_photos')
                    .querySelectorAll('.attachment_photo').length -
                    files_cnt -
                    1
                ];
                const mes_image = document
                  .querySelector('#display')
                  .querySelectorAll('.mes_img')[
                  document
                    .querySelector('#display')
                    .querySelectorAll('.mes_img').length -
                    files_cnt -
                    1
                ];

                img.onclick = attachment_photo.onclick = function () {
                  modal.style.display = 'block';
                  modalImg.src = this.src;
                  document.querySelector('#media_display').style.display =
                    'flex';
                  if (
                    temp
                      .querySelector('.message')
                      .getElementsByTagName('span')[1].textContent == undefined
                  )
                    captionText.innerHTML = '';
                  else
                    captionText.innerHTML = temp
                      .querySelector('.message')
                      .getElementsByTagName('span')[1].textContent;
                };
              }
            })();

            ++counter_img;

            all_photos_and_videos.push(user_file);

            if (new_month_check) $('#attachment_photos').prepend(block_month);
          } else if (
            file_type == 'mp3' ||
            file_type == 'ogg' ||
            file_type == 'wav'
          ) {
            user_file_pres.innerHTML = file_new_name;

            audio_files.push(user_file);
            audio_array_index = audio_files.length - 1;

            user_file_pres.setAttribute(
              'onclick',
              'audio_play("' +
                audio_array_index +
                '" ,"' +
                file_new_name +
                file_type_from_name +
                '");'
            );

            user_file_pres.setAttribute('class', 'audio_message_div');

            //                                        user_file_pres = "<div onclick='audio_play(\"" + user_file + "\" ,\""+ file_new_name + file_type_from_name + "\");'>" + file_new_name + file_type_from_name + "</div><a download=\"" + file_new_name + file_type_from_name + "\" target='_blank' href=\"" + user_file_additional + "\">X</a>";

            //                                        attach_file.innerHTML = "<audio loading='eager' controls><source type='audio/mpeg' src=\"" + user_file + "\"></audio>";
            attachment_music.prepend(attach_file);

            if (new_month_check) $('#user_file_pres').prepend(block_month);
          } else if (
            file_type == 'mp4' ||
            file_type == 'mov' ||
            file_type == 'MOV'
          ) {
            ++counter_img;
            //                                        user_file_pres = "<video loading='lazy' class='mes_img' controls><source type='video/mp4' src=\"" + user_file + "\"></video>";

            var vd = document.createElement('video');
            vd.setAttribute('controls', '');
            vd.setAttribute('class', 'mes_img');
            sr = document.createElement('source');
            sr.setAttribute('type', 'video/mp4');
            sr.src = user_file;
            vd.appendChild(sr);
            user_file_pres.appendChild(vd);
            attach_file.innerHTML =
              "<video loading='lazy' class='attachment_photo' controls><source type='video/mp4' src=\"" +
              user_file +
              '"></video>';

            //                                        vd.onloadeddata  = function(){
            //                                            document.querySelector(".room_body").scrollTo({
            //                                                top: document.querySelector(".room_body").scrollHeight,
            //                                            });
            //                                        }

            attachment_videos.prepend(attach_file);

            all_photos_and_videos.push(user_file);

            if (new_month_check) $('#attachment_videos').prepend(block_month);
          } else {
            //                                        user_file_pres = "<a id='user_link' download=\"" + file_new_name + "\" target='_blank' href=\"" + user_file + "\">Link to the file</a>";
            attach_file.innerHTML =
              "<a target='_blank' href=\"" +
              user_file +
              '">Link to the file</a>';
            attachment_files.prepend(attach_file);
            if (new_month_check) $('#attachment_files').prepend(block_month);
          }

          user_file_pres_span = document.createElement('span');
          user_file_pres_span.classList.add('user_file_pres');
          user_file_pres_span.appendChild(user_file_pres);
          message_div_temp.insertAdjacentElement(
            'afterbegin',
            user_file_pres_span
          );
          all_files += user_file_pres;
        }
      }

      viewed = document.createElement('img');
      viewed.setAttribute('id', 'viewed_check');
      if (
        response.messages[key].user ==
        document.querySelector('#username_id').value
      ) {
        if (response.messages[key].viewed.length) {
          viewed.src =
            '//' +
            window.location.host +
            '/static/Images/dialogs_received@3x.png';
        } else
          viewed.src =
            '//' + window.location.host + '/static/Images/dialogs_sent@3x.png';
      } else viewed.style.display = 'none';

      liked_div = document.createElement('div');

      liked = document.createElement('img');
      liked.src = '//' + window.location.host + '/static/Images/like_emoji.png';
      liked.setAttribute('id', 'liked_check');

      stellar_particles = document.createElement('img');
      stellar_particles.setAttribute('id', 'stellar_particles');
      url =
        '//' + window.location.host + '/static/Images/stellar_particles.gif';
      // url =
      //   '//' +
      //   window.location.host +
      //   '/static/Images/ba22df081398487fb3599e23fbacaa5b.webm';
      stellar_particles.src = url;

      if (response.messages[key].liked == true) {
        liked.style.display = 'unset';
        reaction_span.classList.add('active');
      }

      temp.setAttribute('class', 'message_div');
      temp.setAttribute('value', response.messages[key].id);

      liked_div.appendChild(liked);
      liked_div.appendChild(stellar_particles);

      // message_div_temp = document.createElement('div');
      message_div_temp.classList.add('message');

      mes_span = document.createElement('span');
      mes_span.classList.add('message_span');
      mes_span.textContent = mes;

      viewed_span = document.createElement('span');
      viewed_span.setAttribute('id', 'viewed_span');
      viewed_span.appendChild(viewed);

      time_left = document.createElement('span');
      time_left.classList.add('time-left');
      const timeString = response.messages[key].date.slice(11, 16);
      const [hours, minutes] = timeString.split(':');
      let hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      time_left.textContent = `${hour}:${minutes} ${ampm}`;

      reaction_span.setAttribute('id', 'reaction_span');
      reaction_span.appendChild(liked_div);

      const elements = document.querySelectorAll('.message');

      const ro = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const el = entry.target;

          const rect = el.getBoundingClientRect();
          const parent = el.parentElement;

          parent.style.width = rect.width + 'px';
          parent.style.height = rect.height + 'px';
        });
      });

      // elements.forEach((el) => ro.observe(el));

      message_div_temp_separator = document.createElement('div');
      message_div_temp_separator.classList.add('message_div_temp_separator');

      message_div_subdata = document.createElement('div');
      message_div_subdata.classList.add('message_div_subdata');

      message_div_temp_time_view = document.createElement('div');
      message_div_temp_time_view.classList.add('message_div_temp_time_view');
      message_div_temp_time_view.appendChild(time_left);
      message_div_temp_time_view.appendChild(viewed_span);
      message_div_subdata.appendChild(message_div_temp_time_view);

      message_and_reaction = document.createElement('div');
      message_and_reaction.classList.add('message_and_reaction');
      message_and_reaction.appendChild(mes_span);
      message_and_reaction.appendChild(reaction_span);

      message_div_temp_separator.appendChild(message_and_reaction);
      message_div_temp_separator.appendChild(message_div_subdata);

      message_div_temp.appendChild(message_div_temp_separator);

      temp.appendChild(message_div_temp);

      if (
        response.messages[key].user !=
        document.querySelector('#username_id').value
      ) {
      } else {
        temp.classList.add('darker');
      }
      if (mes == '' && temp.querySelector('.mes_img') != null) {
        temp
          .querySelector('.message_div_temp_separator')
          .setAttribute(
            'style',
            'position: absolute; bottom: 0px; right: 0px; border-radius: 30px; padding: 5px; top: unset;'
          );
        temp
          .querySelector('.time-left')
          .setAttribute('style', 'color: #fff; margin: 0;');
        temp
          .querySelector('#reaction_span')
          .setAttribute('style', 'margin: 0 5px 0 0;');
        temp
          .querySelector('#viewed_span')
          .setAttribute('style', 'margin: 0 0 0 5px;');
      }

      var files_num = -1;
      for (var files_key in files_message) {
        if (files_message[files_key].mes_id == response.messages[key].id) {
          var file_type = files_message[files_key].file
            .split('.')
            .pop()
            .toLowerCase();
          if (
            user_file != '' &&
            (file_type == 'jpg' ||
              file_type == 'png' ||
              file_type == 'jpeg' ||
              file_type == 'jpg' ||
              file_type == 'mp4' ||
              file_type == 'mov')
          ) {
            ++files_num;
            var modal = document.getElementById('myModal');
            img_comment = document.getElementById('img_comment');
            var modalImg = document.getElementById('img01');
            var captionText = document.getElementById('caption');
            temp.getElementsByClassName('mes_img')[files_num].onmousedown =
              attachment_photo.onmousedown = function () {
                modal.style.display = 'block';
                modalImg.src = this.src;
                document.querySelector('#media_display').style.display = 'flex';

                if (
                  temp.querySelector('.message').getElementsByTagName('span')[0]
                    .textContent == undefined
                )
                  captionText.innerHTML = '';
                else
                  captionText.innerHTML = temp
                    .querySelector('.message')
                    .getElementsByTagName('span')[0].textContent;
              };
          }
        }
      }

      temp
        .querySelector('.message')
        .setAttribute('value', response.messages[key].user);
      setTimeout(function () {
        temp.querySelector('.message').classList.add('active');
      }, 0);

      temp_full = document.createElement('div');
      temp_full.setAttribute('class', 'temp_full');

      if (
        response.messages[key].user ==
        document.querySelector('#username_id').value
      ) {
        temp.classList.add('right');
      }

      let timesToSelect = Date();
      let touchStartTime = 0;
      let touchTimer = null;
      let modalTimer = null;

      temp.addEventListener(
        'touchstart',
        function (e) {
          timesToSelect = 0;
          touchStartTime = Date.now();

          touchTimer = setTimeout(function () {
            temp.classList.add('select');
            modalTimer = setTimeout(function () {
              document.querySelector('#myModal').style.display = 'block';
              temp.classList.add('contextMenu');
              // themeMeta.content = '#0e0e0e';
              // document.querySelector('body').style.backgroundColor = '#0e0e0e';
            }, 250);
          }, 100);
        },
        { passive: false }
      );

      temp.addEventListener('touchend', function (e) {
        if (touchTimer) {
          const touchDuration = Date.now() - touchStartTime;
          if (touchDuration < 350) {
            temp.classList.remove('contextMenu');
            setTimeout(function () {
              temp.classList.remove('select');
            }, 500 - touchDuration);
          }
          clearTimeout(touchTimer);
          clearTimeout(modalTimer);
          touchTimer = null;
          modalTimer = null;
          // themeMeta.content = '#050505';
        }
      });

      temp.addEventListener('touchcancel', function (e) {
        if (touchTimer) {
          const touchDuration = Date.now() - touchStartTime;
          if (touchDuration < 350) {
            temp.classList.remove('contextMenu');
            setTimeout(function () {
              temp.classList.remove('select');
            }, 500 - touchDuration);
          }
          temp.classList.remove('contextMenu');
          clearTimeout(touchTimer);
          clearTimeout(modalTimer);
          touchTimer = null;
          modalTimer = null;
          temp.classList.remove('select');
        }
      });

      temp.addEventListener(
        'touchmove',
        function (e) {
          if (touchTimer) {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 350) {
              temp.classList.remove('contextMenu');
              setTimeout(function () {
                temp.classList.remove('select');
              }, 500 - touchDuration);
            }
            clearTimeout(touchTimer);
            clearTimeout(modalTimer);
            touchTimer = null;
            modalTimer = null;
            temp.classList.remove('select');
          }
        },
        { passive: false }
      );

      temp_full.appendChild(temp);

      if (counter_img % 2 != 0)
        message_div_temp.querySelector('.user_file_pres').style.width = '432px';
      if (counter_img % 2 != 0 && window.innerWidth <= 768)
        message_div_temp.querySelector('.user_file_pres').style.width = '80vw';

      function smoothScrollToBottom(duration = 1000) {
        const element = document.querySelector('#display');
        const start = element.scrollTop;
        const end = element.scrollHeight - element.clientHeight;
        const change = end - start;
        const startTime = performance.now();

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function animateScroll(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(progress);

          element.scrollTop = start + change * eased;

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        }

        requestAnimationFrame(animateScroll);
      }

      function getFlexContainerExpandedHeight(container) {
        // Если контейнер имеет фиксированную высоту
        const computedStyle = getComputedStyle(container);
        const flexDirection = computedStyle.flexDirection;

        if (flexDirection === 'column' || flexDirection === 'column-reverse') {
          // Для вертикального flex - scrollHeight показывает полную высоту
          return container.scrollHeight;
        }

        return container.offsetHeight;
      }

      if (new_message) {
        if (temp.classList.contains('right'))
          temp_full.classList.add('new_message_own');
        else temp_full.classList.add('new_message_not_own');
        const display = document.querySelector('#display');
        const displayAfter = window.getComputedStyle(display, '::after');
        const heightString = displayAfter.height;
        const heightValue = parseInt(heightString) || 0;
        const old_scrollTop = display.scrollTop;
        $('#display').prepend(temp_full);

        document.documentElement.style.setProperty(
          '--display-after-height',
          `${heightValue}px`
        );

        display.scrollTop = old_scrollTop - temp_full.offsetHeight;

        function smoothScrollToTop(element) {
          return new Promise((resolve) => {
            element.scrollTo({
              top: 0,
              behavior: 'smooth',
            });

            const onTransitionEnd = () => {
              element.removeEventListener('transitionend', onTransitionEnd);
              resolve();
            };

            element.addEventListener('transitionend', onTransitionEnd);

            setTimeout(resolve, 500);
          });
        }

        setTimeout(async function () {
          await smoothScrollToTop(display);

          // document.documentElement.style.setProperty(
          //   '--display-after-height',
          //   `${heightValue - temp_full.offsetHeight}px`
          // );
        }, 10);
      } else $('#display').append(temp_full);

      all_messages_dives.push(temp_full);
      temp_full.addEventListener('contextmenu', (e) => {
        var tooltip = document.getElementById('myTooltip');
        var selectionText = getSelectionText();
        if (selectionText.length > 10)
          selectionText = selectionText.slice(0, 10);
        tooltip.innerHTML = 'Copied: ' + selectionText + '...';
        e.preventDefault();
        let x = e.pageX,
          y = e.pageY,
          winWidth = window.innerWidth,
          winHeight = window.innerHeight,
          cmWidth = contextMenu.offsetWidth,
          cmHeight = contextMenu.offsetHeight;

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'unset';

        window.addEventListener('mousemove', (e) => {
          if (
            e.clientY - contextMenu.offsetTop - contextMenu.offsetHeight > 50 ||
            e.clientY - contextMenu.offsetTop < -50 ||
            e.clientX - contextMenu.offsetLeft - contextMenu.offsetWidth > 50 ||
            e.clientX - contextMenu.offsetLeft < -50
          )
            contextMenu.style.display = 'none';
        });
      });

      /*                            temp_full.onmousedown = function(){
                                all_messages_dives[20].scrollIntoView({
                                    behavior: "smooth",
                                    block: "end",
                                    inline: "nearest",
                                })
                                all_messages_dives[20].classList.add("active");
                                setTimeout(function(){all_messages_dives[20].classList.remove("active");},500);
                            }*/

      function check_viewed(event) {
        chatSocket[room].send(
          JSON.stringify({
            message_id: [temp.getAttribute('value')],
            type: 'message_viewed',
            room_id: room,
            contacts_id: document.querySelector('#username_id').value,
          })
        );

        temp_full.removeEventListener('mouseover', check_viewed);
      }

      if (
        response.messages[key].user !=
        document.querySelector('#username_id').value
      ) {
        if (
          !response.messages[key].viewed.includes(
            parseInt(document.querySelector('#username_id').value)
          )
        ) {
          last_read = temp_full;
          unread_messages.add(temp_full);
          temp_full.addEventListener('mouseover', check_viewed);
        } else if (!check_last_message_bar && last_read != null) {
          const unread_message_bar = document.createElement('div');
          unread_message_bar.textContent = 'Unread Messages';
          unread_message_bar.setAttribute('class', 'unread_message_bar');
          $('#display').append(unread_message_bar);
          check_last_message_bar = true;
        }
      }

      //                            document.querySelector("#display").addEventListener('scroll', function() {
      ////                                if(Visible(temp) && response.messages[key].viewed == false && response.messages[key].user != document.querySelector("#username_id").value) {
      //                                    console.clear();
      ////                                    chatSocket_current.send(JSON.stringify({
      ////                                        'message_id': temp.getAttribute('value'),
      ////                                        'type': "message_viewed",
      ////                                        'room_id': room,
      ////                                        'message_text': '',
      ////                                    }));
      ////                                }
      //                            });

      all_messages[temp.getAttribute('value')] = temp_full;

      enableDoubleTap(temp_full, function () {
        chatSocket[room].send(
          JSON.stringify({
            message_id: this.firstChild.getAttribute('value'),
            type: 'message_reaction',
            room_id: room,
            contacts_id: document.querySelector('#username_id').value,
          })
        );
      });

      if (key == check_mes_update - 1) temp.setAttribute('id', 'last_message');

      if (
        key == 0 ||
        (key > 0 &&
          response.messages[key].date.slice(0, 10) !=
            response.messages[key - 1].date.slice(0, 10))
      ) {
        month = response.messages[key].date.slice(5, 7) - 1;
        block_date.setAttribute('class', 'block_date');
        block_date.innerHTML =
          months[month] + ' ' + (response.messages[key].date.slice(8, 10) - 0);
        $('#display').append(block_date);
        block_date_dict[response.messages[key].date.slice(0, 10)] = temp_full;
      }

      if (document.querySelector('.block_date') != null)
        document.querySelectorAll('.block_date').forEach((element) => {
          element.onclick = function () {
            document.querySelector('.calendar_div').style.display = 'block';
            document.querySelector('#myModal').style.display = 'block';
          };
        });
    }

    if (load_check) {
      document.documentElement.style.setProperty(
        '--display-after-height',
        `${0}px`
      );
      const styles = window.getComputedStyle(document.documentElement);

      const safeAreaBottom = parseFloat(
        styles.getPropertyValue('--sab') || '0px'
      );
      const safeAreaTop = parseFloat(styles.getPropertyValue('--sat') || '0px');

      const display = document.querySelector('#display');
      const displayAfter = window.getComputedStyle(display, '::after');
      const heightString = displayAfter.height;
      const heightValue = parseInt(heightString) || 0;
      document.documentElement.style.setProperty(
        '--display-after-height',
        `${parseFloat(heightValue) + 2 - 50 - safeAreaTop}px`
      );

      // document.querySelector('#display').scrollTo({
      //   top: document.querySelector('#display').scrollHeight,
      // });
      //   if (last_read != null) {
      //     last_read.scrollIntoView({
      //       block: 'end',
      //       inline: 'nearest',
      //     });
      //   } else
      //     document.querySelector('#display').scrollTo({
      //       top: document.querySelector('#display').scrollHeight,
      //     });
    }

    // Clone with events and data (true, true)
    // Копируем HTML из #display в .display_clone
    // setTimeout(function () {
    //   document.querySelector('.display_clone').innerHTML =
    //     document.querySelector('#display').innerHTML;
    // }, 500);

    if (load_check) load_check = 0;
  }

  scroll_appear = false;
  document.querySelector('.scroll_down').onclick = function () {
    scroll_appear = true;
    auto_scroll = true;
    viewed_check_messages = new Set();
    unread_messages.forEach(function (event) {
      if (
        event.querySelector('.message').getAttribute('value') !=
        document.querySelector('#username_id').value
      ) {
        viewed_check_messages.add(
          event.querySelector('.message_div').getAttribute('value')
        );
      }
    });

    viewed_check_messages = Array.from(viewed_check_messages);

    chatSocket[room].send(
      JSON.stringify({
        message_id: viewed_check_messages,
        type: 'message_viewed',
        room_id: room,
        contacts_id: document.querySelector('#username_id').value,
      })
    );
  };

  document
    .querySelector('.scroll_down')
    .addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelector('#display').scrollTo({
        behavior: 'smooth',
        top: document.querySelector('#display').scrollHeight,
      });
    });

  selected_messages = new Set();
  select_message_onclick_allowed = false;
  delete_message_select_check = false;
  prev_div = '';
  first_message_div_selected = '';

  document.querySelector('#uil-select').onclick = function () {
    document
      .querySelector('#display')
      .addEventListener('click', select_messages_touch);
    select_prepare_contexxtMenu();
  };

  function select_prepare_contexxtMenu() {
    document.querySelectorAll('.message_div').forEach(function (event) {
      event.classList.add('selected_prepare');
    });

    document.querySelectorAll('.temp_full').forEach(function (event) {
      select_check = document.createElement('input');
      select_check.type = 'checkbox';
      select_check.addEventListener('click', function (event) {
        event.preventDefault();
      });
      select_check.setAttribute('class', 'message_select_check');
      event.prepend(select_check);
    });
  }

  function select_messages_touch(event) {
    evnt = event.target.closest('.temp_full');

    if (evnt != null) {
      if (
        evnt.classList.contains('temp_full') &&
        !evnt.classList.contains('selected')
      ) {
        evnt.classList.add('selected');
        evnt.querySelector('.message_select_check').checked = true;
        selected_messages.add(
          evnt.querySelector('.message_div').getAttribute('value')
        );
      } else if (evnt.classList.contains('selected')) {
        evnt.classList.remove('selected');
        selected_messages.delete(
          evnt.querySelector('.message_div').getAttribute('value')
        );
        evnt.querySelector('.message_select_check').checked = false;
        if (selected_messages.size == 0) {
          document
            .querySelector('#display')
            .removeEventListener('click', select_messages_touch);

          window.getSelection().removeAllRanges();
          document.querySelectorAll('.temp_full').forEach(function (event) {
            event.removeChild(event.querySelector('.message_select_check'));
          });

          document.querySelectorAll('.message_div').forEach(function (event) {
            event.classList.remove('selected_prepare');
          });
        }
      }
    }
  }

  document.querySelector('#display').onmousedown = function (e) {
    if (e.which == 1) {
      if (
        e.target.classList.contains('temp_full') ||
        (e.target.closest('.temp_full') && select_message_onclick_allowed)
      ) {
        if (e.target.classList.contains('selected'))
          delete_message_select_check = true;
        else delete_message_select_check = false;

        if (!delete_message_select_check) first_message_div_selected = e.target;
        prev_div = e.target;
        if (select_message_onclick_allowed) select_messages(event, false);
        document
          .querySelector('#display')
          .addEventListener('mousemove', select_messages);

        window.addEventListener('keydown', selected_messages_escape);
      }
    }
  };

  document.querySelector('#display').onmouseup = function (e) {
    document
      .querySelector('#display')
      .removeEventListener('mousemove', select_messages);
    first_message_div_selected = '';
  };

  let lastScrollTop = 0;
  function scrollShakeMessages(e) {
    const display = document.querySelector('#display');
    const tempFullElements = document.querySelectorAll('#display .temp_full');
    const scrollTop = display.scrollTop;

    const scroll_direction = scrollTop > lastScrollTop ? 1 : -1;

    lastScrollTop = scrollTop;

    tempFullElements.forEach((element) => {
      // Получаем позицию элемента относительно контейнера
      const elementRect = element.getBoundingClientRect();
      const containerRect = display.getBoundingClientRect();

      // Проверяем, виден ли элемент в контейнере

      const isVisible =
        elementRect.top < containerRect.bottom &&
        elementRect.bottom > containerRect.top;

      if (isVisible) {
        // Вычисляем, насколько элемент находится в зоне видимости
        const visibilityRatio = Math.min(
          1,
          Math.max(
            0,
            (containerRect.bottom - elementRect.top) / elementRect.height
          )
        );

        // Создаем эффект запаздывания - чем меньше visibilityRatio, тем больше запаздывание
        const delayFactor = 0.3; // Коэффициент запаздывания (0-1)
        const translateY = scroll_direction * 30; // Максимальное смещение 50px
        // Применяем трансформацию с плавным переходом
        element.style.transition = 'transform 0.4s ease-in-out';
        element.style.transform = `translateY(${translateY}px)`;
      } else {
        // Сбрасываем трансформацию для невидимых элементов
        element.style.transition = 'transform 0.4s ease-in-out';
        element.style.transform = 'translateY(0px)';
      }
    });
  }

  // document
  //   .querySelector('#display')
  //   .addEventListener('scroll', scrollShakeMessages);

  let touchStartTime = 0;
  let touchStartY = 0;

  document
    .querySelector('#display')
    .addEventListener('touchstart', function (event) {
      if (event.touches && event.touches.length > 0) {
        touchStartTime = Date.now();
        touchStartY = event.touches[0].screenY;
      }
    });

  document
    .querySelector('#display')
    .addEventListener('touchmove', function (event) {
      const touch = event.touches[0];

      document
        .querySelector('.send_div')
        .setAttribute('style', 'transition: padding-bottom 0s !important');
      document
        .querySelector('#display')
        .setAttribute('style', 'transition: padding-bottom 0s !important');

      const screenY = touch.screenY;
      if (screenY > send_div_height_focus_var) {
        document.documentElement.style.setProperty(
          '--send_div_height_focus',
          `${Math.max(window.innerHeight - screenY - 45, 35)}px`
        );
      }
    });

  document
    .querySelector('#display')
    .addEventListener('touchend', function (event) {
      const touchEndTime = Date.now();
      const timeDiff = touchEndTime - touchStartTime;

      document.querySelector('.send_div').setAttribute('style', '');
      document.querySelector('#display').setAttribute('style', '');

      if (event.changedTouches && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const touchEndY = touch.screenY;
        if (touchEndY <= send_div_height_focus_var) return;

        const distance = Math.abs(touchEndY - touchStartY);
        const velocity = timeDiff > 0 ? distance / timeDiff : 0;

        const isFastSwipe = velocity > 0.3;
        const isInBottomArea = touch.screenY > window.innerHeight - 100;

        if (isFastSwipe) {
          send_div_height_focus_var = 0;
          textareaElement.blur();
        } else if (isInBottomArea) {
          send_div_height_focus_var = 0;
          textareaElement.blur();
        }
      }

      document.documentElement.style.setProperty(
        '--send_div_height_focus',
        `${send_div_height_focus_var}px`
      );
    });

  prev_scroll_height = 0;
  document
    .querySelector('#display')
    .addEventListener('scroll', function (event) {
      if (document.querySelector('#display').scrollTop < 300) {
        // scroll_more += 20;
        // message_initialization(messages_response);
      }
      scroll_appear = false;
      // if (
      //   document.querySelector('#display').clientHeight +
      //     document.querySelector('#display').scrollTop ==
      //   document.querySelector('#display').scrollHeight
      // )
      //   scroll_appear = false;

      if (
        !scroll_appear &&
        document.querySelector('#display').scrollTop < -50
      ) {
        if (
          !document.querySelector('.scroll_down').classList.contains('active')
        ) {
          document.querySelector('.scroll_down').classList.add('active');
          scroll_more += 25;
          auto_scroll = false;
        }
      } else if (
        document.querySelector('.scroll_down').classList.contains('active')
      ) {
        document.querySelector('.scroll_down').classList.remove('active');
      }
    });

  function select_messages(event, click_check = true) {
    evnt = event.target.closest('.temp_full');

    if (
      evnt != null &&
      (first_message_div_selected != evnt || select_message_onclick_allowed)
    ) {
      if (!select_message_onclick_allowed) {
        document.querySelectorAll('.message_div').forEach(function (event) {
          event.classList.add('selected_prepare');
        });

        document.querySelectorAll('.temp_full').forEach(function (event) {
          select_check = document.createElement('input');
          select_check.class = 'select_checkbox';
          select_check.type = 'checkbox';
          //            select_check.disabled = true;
          select_check.addEventListener('click', function (event) {
            event.preventDefault();
          });
          select_check.setAttribute('class', 'message_select_check');
          event.insertBefore(select_check, event.firstChild);
        });
      }
      select_message_onclick_allowed = true;
      if (
        !delete_message_select_check &&
        (evnt != prev_div || click_check == false) &&
        evnt.classList.contains('temp_full') &&
        !evnt.classList.contains('selected')
      ) {
        if (prev_div == first_message_div_selected) {
          prev_div.classList.add('selected');
          prev_div.querySelector('.message_select_check').checked = true;
          selected_messages.add(
            prev_div.querySelector('.message_div').getAttribute('value')
          );
          first_message_div_selected = '';
        }
        prev_div = event.target;
        evnt.classList.add('selected');
        evnt.querySelector('.message_select_check').checked = true;
        selected_messages.add(
          evnt.querySelector('.message_div').getAttribute('value')
        );
      } else if (
        delete_message_select_check &&
        evnt.classList.contains('selected') &&
        (evnt != prev_div || click_check == false)
      ) {
        evnt.classList.remove('selected');
        prev_div = '';
        selected_messages.delete(
          evnt.querySelector('.message_div').getAttribute('value')
        );
        evnt.querySelector('.message_select_check').checked = false;
        if (selected_messages.size == 0) {
          select_message_onclick_allowed = false;
          document
            .querySelector('#display')
            .removeEventListener('mousemove', select_messages);
          first_message_div_selected = '';
          window.getSelection().removeAllRanges();
          document.querySelectorAll('.temp_full').forEach(function (event) {
            event.removeChild(event.querySelector('.message_select_check'));
          });

          document.querySelectorAll('.message_div').forEach(function (event) {
            event.classList.remove('selected_prepare');
          });
        }
      }
    }
  }

  function selected_messages_escape(event) {
    if (event.keyCode == 27) {
      select_message_onclick_allowed = false;
      document.querySelectorAll('.temp_full').forEach(function (event) {
        event.classList.remove('selected');
        event.removeChild(event.querySelector('.message_select_check'));
      });
      document.querySelectorAll('.message_div').forEach(function (event) {
        event.classList.remove('selected_prepare');
      });
      selected_messages.clear();
      window.removeEventListener('keydown', selected_messages_escape);
      document
        .querySelector('#display')
        .removeEventListener('mousemove', select_messages);
    }
  }

  window.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) {
      if ($('.search_field').is(':focus')) {
        $('.search_field').val('');
        $('.search_field').blur();
        return;
      }
      if (!selected_messages.size && window.location.hash.slice(1) != 0) {
        window.location.hash = 0;
        if (choose_list_swiped) {
          clearTimeout(choose_list_swiped);
        }
        hashChange();
      }
    }
  });

  //document.querySelector("#display").onmouseup = function(){
  //    window.removeEventListener("mousemove", select_messages);
  //}
  //
  //selectMessageDiv = function(event){
  //    window.addEventListener("mousemove", (e) => {
  //    })
  //}

  shadow_degree = 0;

  // document.querySelector('#shadow_degree_chat').oninput = function (e) {
  //   shadow_degree = document.querySelector('#shadow_degree_chat').value;
  //   document.documentElement.style.setProperty(
  //     '--shadow_degree',
  //     `${shadow_degree}deg`
  //   );
  // };

  document.querySelector('#shadow_degree_chat').onchange = function (e) {
    setCookie('room_BG_shadow', this.value, 7);
  };

  //	document.querySelector("#chat_background_image").oninput = function(e){
  //
  //	    file = this.files[0]
  //        var reader  = new FileReader();
  //
  //        reader.onloadend = function () {
  //            document.querySelector(".room_div").style.backgroundImage  = "url(" + reader.result + ")";
  //        }
  //
  //        if (file) {
  //            reader.readAsDataURL(file);
  //        }
  //	}

  const create_new_group_room = document.querySelector(
    '#create_new_group_room'
  );
  let create_new_group_room_touch_start_pos = 0;

  create_new_group_room.ontouchstart = function (event) {
    create_new_group_room_touch_start_pos = event.touches[0].clientY;
    create_new_group_room.style.transition = 'translate 0s';
  };

  create_new_group_room.ontouchmove = function (event) {
    event.preventDefault();
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - create_new_group_room_touch_start_pos;

    if (deltaY > 0) {
      create_new_group_room.style.translate = `0 ${deltaY}px`;
    }
  };

  create_new_group_room.ontouchend = function (event) {
    const endY = event.changedTouches[0].clientY;
    const deltaY = endY - create_new_group_room_touch_start_pos;
    create_new_group_room.style.transition = 'translate 0.3s';
    if (deltaY > 50) {
      $('#creation_group_GIVE_A_NAME_input').blur();
      document
        .querySelector('.creation_group_second_page')
        .classList.remove('active');
      document
        .querySelector('.creation_group_first_page')
        .classList.add('active');
      create_new_group_room.classList.remove('active');
    } else {
      create_new_group_room.style.translate = '0 0';
    }
    create_new_group_room.style = '';
  };

  create_new_group_list_contacts = [];

  document.querySelector('#creation_group_CANCEL').onclick =
    document.querySelector('#creation_group_CANCEL_GROUPNAME').onclick =
      function (event) {
        document
          .querySelector('.creation_group_second_page')
          .classList.remove('active');
        document
          .querySelector('.creation_group_first_page')
          .classList.add('active');
        document
          .querySelector('#create_new_group_room')
          .classList.remove('active');
        document.querySelector('#creation_group_GIVE_A_NAME_input').value = '';
      };

  const nextButton = document.querySelector('#creation_group_NEXT_GROUPNAME');

  function shakeButton(button) {
    button.style.animation = 'none';

    void button.offsetWidth;

    button.style.animation = 'shakeError 0.5s ease-in-out';

    setTimeout(() => {
      button.style.animation = '';
    }, 500);
  }

  document.querySelector('#creation_group_NEXT_GROUPNAME').onmousedown =
    document.querySelector('#creation_group_NEXT_GROUPNAME').ontouchstart =
      function (e) {
        e.preventDefault();
        if ($('#creation_group_GIVE_A_NAME_input').is(':focus'))
          $('#creation_group_GIVE_A_NAME_input').focus();

        if (
          document.querySelector('#creation_group_GIVE_A_NAME_input').value
            .length < 1
        ) {
          shakeButton(this);
          return;
        }
        document
          .querySelector('.creation_group_second_page')
          .classList.add('active');
        document
          .querySelector('.creation_group_first_page')
          .classList.remove('active');
      };

  document.querySelector('#creation_group_CREATE').onclick = function (event) {
    document
      .querySelector('.creation_group_second_page')
      .classList.remove('active');
    document
      .querySelector('.creation_group_first_page')
      .classList.add('active');
    document.querySelector('#create_new_group_room').classList.remove('active');
    create_new_group_list_contacts = [];
    document
      .querySelector('.all_my_contacts')
      .querySelectorAll('.users_full_form')
      .forEach(function (event) {
        if (
          event
            .querySelector('.create_new_group_choose')
            .getElementsByTagName('input')[0].checked
        ) {
          create_new_group_list_contacts.push(
            event.getElementsByTagName('input')[1].getAttribute('value')
          );
        }
      });
    create_new_group_list_contacts.push(
      document.querySelector('#username_id').value
    );

    formData = new FormData();
    formData.append(
      'csrfmiddlewaretoken',
      $('input[name=csrfmiddlewaretoken]').val()
    );
    formData.append(
      'room_avatar',
      document.querySelector('#input_room_avatar').files[0]
    );
    formData.append(
      'contacts_id',
      JSON.stringify(create_new_group_list_contacts)
    );
    formData.append(
      'room_name',
      document.querySelector('#creation_group_GIVE_A_NAME_input').value
    );
    formData.append('room_type', 'G');
    $.ajax({
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      url: '/save_room_avatar',
      data: formData,
      success: function (response) {
        for (
          contact = 0;
          contact < create_new_group_list_contacts.length;
          ++contact
        ) {
          (async () => {
            const contact_ = contact;
            url_contact = `${ws_protocol}${window.location.host}/socket-server/user/${create_new_group_list_contacts[contact]}/`;
            chatSocket_contact = new WebSocket(await url_contact);

            chatSocket_contact.onopen = function () {
              this.send(
                JSON.stringify({
                  type: 'create_new_room',
                  room_id: response.id,
                })
              );
              this.close();
            };
          })();
        }
      },
    });
  };

  /*//    document.querySelector(".room_div").style.cssText += "filter: blur(1px)";*/

  function urlify(text) {
    var link = /(https?:\/\/[^\s]+)/g;
    var user = /@[^\s]+/g;
    var email = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    var urlRegex = new RegExp(
      link.source + '|' + user.source + '|' + email.source
    );
    return text.replace(urlRegex, function (url) {
      // <!--                        attach_file.innerHTML = '<a id="link_in_mes" target="_blank" href="' + url + '">' + url + '</a>';-->
      // <!--                        attachment_links.prepend(attach_file);-->
      if (email.test(url))
        return (
          '<pre><a id="link_in_mes" target="_blank" href="mailto:' +
          url +
          '">' +
          url +
          '</a></pre>'
        );
      if (link.test(url))
        return (
          '<a id="link_in_mes" target="_blank" href="' +
          url +
          '">' +
          url +
          '</a>'
        );
    });
  }
  //	var all_audio = document.getElementsByTagName("audio");
  //	var index = 0;
  //	for (i = 0; i < all_audio.length; i++) {
  //		all_audio[i].id = i;
  //		all_audio[i].onended = function() {
  //			index = parseInt(this.id) + 1;
  //			if (index == all_audio.length) index = 0;
  //			all_audio[index].play();
  //		}
  //	}
  $(function () {
    $('audio').on('play', function () {
      $('audio')
        .not(this)
        .each(function (index, audio) {
          audio.pause();
        });
    });
  });

  //     $("textarea").on("input", function () {
  //     this.style.height = "0";
  //     const textareaHeight = this.scrollHeight + 8;
  //     this.style.height = textareaHeight + "px";

  //     const container = this.closest('.send_div');
  //     container.style.height = textareaHeight+10 + "px";
  // });

  $('textarea').on('input', function () {
    if (this.value.length == 0) {
      textAreaPlaceHolder.classList.remove('input');
      document.querySelector('#selfie').classList.remove('hidden');
    } else {
      document.querySelector('#selfie').classList.add('hidden');
      textAreaPlaceHolder.classList.add('input');
    }
    this.style.height = 0;
    this.style.height = this.scrollHeight + 'px';
    this.scrollTop = this.scrollHeight;
  });

  $('.textarea').on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey || e.altKey) && e.which === 13) {
      e.preventDefault();

      const textarea = this;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      textarea.value = value.substring(0, start) + '\n' + value.substring(end);

      textarea.selectionEnd = start + 1;

      $(textarea).trigger('input');
    } else if (
      e.which === 13 &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      this.style.height = 28 + 'px';
      if ($(this).val().replace(/\s/g, '').length && send_allowed)
        $(this).closest('form').submit();
    }
  });

  function isEmpty(str) {
    if (str.trim() == '') return true;
    return false;
  }
  const modalContainer = document.querySelector('#myModal');
  modalContainer.ontouchstart = modalContainer.onmousedown = function (e) {
    all_messages_dives.forEach((element) => {
      element.querySelector('.message_div').classList.remove('select');
      element.querySelector('.message_div').classList.remove('contextMenu');
    });
    // document.querySelector('body').style.backgroundColor = '#1e1e1e';
    // themeMeta.content = '#000000';
    this.style.display = 'none';
  };

  function getFormattedLocalTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // Получаем микросекунды из performance.now()
    const microseconds = Math.floor((performance.now() % 1000) * 1000)
      .toString()
      .padStart(6, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}`;
  }

  document.querySelector('#media_display').onmousedown = function (e) {
    this.style.display = 'none';
    document.querySelector('#myModal').style.display = 'none';
  };

  function playOverlappingSound(src, volume = 1.0) {
    const message_sent = new Audio(src);
    message_sent.volume = volume;
    message_sent.play().catch((error) => console.log('Play failed:', error));
    return message_sent;
  }

  const button = document.querySelector('.input_submit');
  button.ontouchstart = button.onclick = function (e) {
    if (e.cancelable) {
      e.preventDefault();
    }
    const currentButton = this;

    // Блокируем кнопку на время анимации
    currentButton.style.pointerEvents = 'none';

    // Перезапускаем анимацию
    void currentButton.offsetWidth;
    currentButton.classList.add('send');

    setTimeout(function () {
      currentButton.classList.remove('send');
      currentButton.style.pointerEvents = 'auto';
    }, 200);

    if ($('.textarea').is(':focus')) $('.textarea').focus();
    if (
      !isEmpty(document.querySelector('.textarea').value) ||
      document.querySelector('#file').files.length ||
      document.querySelector('#picture').files.length
    ) {
      $(this).closest('form').submit();
      document.querySelector('.textarea').style.height = 28 + 'px';
      document.querySelector('.textarea').value = '';
    }
  };

  $(document).on('submit', '#post-form', function (e) {
    e.preventDefault();
    let message = txtencode(e.target.message.value, '1234');

    // const original = 'Hello World!';
    // const password = 'strong_password_123';

    // Шифрование
    // let message = SecureTextCoder.encode(e.target.message.value, '1234');

    // loading_sign = document.createElement('div');
    // loading_sign_image = document.createElement('img');
    // loading_sign_image.classList.add('loading_sign_image');
    // loading_sign_image.src =
    //   '//' + window.location.host + '/static/Images/loading_sign.gif';
    // loading_sign.appendChild(loading_sign_image);
    // if (
    //   !document.querySelector('.send_div').querySelector('.loading_sign_image')
    // )
    //   document.querySelector('.send_div').append(loading_sign);
    send_allowed = false;

    const formData = new FormData(this);
    formData.append('message', message);

    const jsonObject = {};

    for (const [key, value] of formData.entries()) {
      jsonObject[key] = value;
    }
    jsonObject.date = getFormattedLocalTime();

    // Функция для конвертации файлов
    function convertFileFormat(fileList) {
      if (!fileList || fileList.length === 0) return [];

      return Array.from(fileList).map((file, index) => {
        // Конвертируем имя файла в hex (как в вашем примере)
        const encoder = new TextEncoder();
        const encoded = encoder.encode(file.name);
        const hexString = Array.from(encoded)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');

        // Сохраняем оригинальное расширение файла
        const fileExtension = file.name.slice(file.name.lastIndexOf('.'));

        return {
          file: `/media/media/${hexString}${fileExtension}_PEVmkad.png`,
          id: 30 + index,
        };
      });
    }
    // Получаем последний ID сообщения (с обработкой случая, когда массив пуст)
    const lastMessage = all_data_rooms[room].messages.at(-1);
    const newMessageId = lastMessage ? lastMessage.id + 1 : 1;

    // Создаем новое сообщение
    const newMessage = {
      allowed_users: [],
      id: newMessageId,
      file: convertFileFormat(document.querySelector('#file').files),
      forwarded: null,
      value: jsonObject.message,
      date: jsonObject.date,
      liked: 0,
      room: parseInt(room),
      user: parseInt(jsonObject.username),
      viewed: [],
    };

    all_data_rooms[room].messages.push(newMessage);

    // playOverlappingSound('static/Sounds/message-sent3.mp3', 1);

    // message_initialization(all_data_rooms[room], true);
    $.ajax({
      type: 'POST',
      url: '/send',
      cache: false,
      contentType: false,
      processData: false,
      data: formData,
      success: function (data) {
        auto_scroll = true;
        load_photo_check = 1;
        if (
          document
            .querySelector('.send_div')
            .querySelector('.loading_sign_image')
        )
          document
            .querySelector('.send_div')
            .querySelector('.loading_sign_image')
            .remove();

        if (chatSocket[room].readyState) {
          chatSocket[room].send(
            JSON.stringify({
              type: 'chat_message',
              room_id: room,
              message_text: message,
            })
          );

          chatSocket[room].addEventListener('message', function () {
            send_allowed = true;
          });

          viewed_check_messages = new Set();
          unread_messages.forEach(function (event) {
            if (
              event.querySelector('.message').getAttribute('value') !=
              document.querySelector('#username_id').value
            ) {
              viewed_check_messages.add(
                event.querySelector('.message_div').getAttribute('value')
              );
            }
          });

          if (viewed_check_messages.length) {
            viewed_check_messages = Array.from(viewed_check_messages);

            chatSocket[room].send(
              JSON.stringify({
                message_id: viewed_check_messages,
                type: 'message_viewed',
                room_id: room,
                contacts_id: document.querySelector('#username_id').value,
              })
            );
          }
        }
      },
    });
    document.querySelector('.textarea').value = '';
    document.querySelector('#file').value = '';
    document.querySelector('#picture').value = '';
  });

  function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  document.querySelector('#file_div').onclick = function () {
    document.querySelector('#file').click();
  };

  document.querySelector('#selfie ').onclick = function () {
    document.querySelector('#picture').click();
  };

  document.onpaste = function (pasteEvent) {
    var item = pasteEvent.clipboardData.items[0];

    if (item.type.indexOf('image') === 0) {
      var blob = item.getAsFile();

      var reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById('copied_image').src = event.target.result;
      };

      reader.readAsDataURL(blob);
    }
  };

  document.addEventListener(
    'keydown',
    function (e) {
      if (
        document.activeElement == document.body &&
        e.which != 17 &&
        e.which != 67
      )
        $('.textarea').focus();
    },
    true
  );

  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        if (cookie.substring(0, name.length + 1) == name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  //          $.ajaxSetup({
  //              global: true,
  //              beforeSend: function(xhr, settings) {
  //                  if(!(/^http:.*//*.test(settings.url) || /^https:.*/.test(settings.url))) {
  //                      xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
  //                      xhr.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded; charset=UTF-8');
  //                  }
  //              },
  //              timeout: 8000
  //          });

  var stringToColor = function stringToColor(str) {
    var hash = 5;
    var color = '#';
    var i;
    var value;
    var strLength;

    if (!str) {
      return color + '333333';
    }

    strLength = str.length;

    for (i = 0; i < strLength; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    for (i = 0; i < 3; i++) {
      value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color;
  };

  document.querySelector('#avatar_profile_set_save').onmousedown =
    function save_profile_avatar() {
      formData = new FormData();
      formData.append(
        'csrfmiddlewaretoken',
        $('input[name=csrfmiddlewaretoken]').val()
      );
      formData.append(
        'user_avatar',
        document.querySelector('#input_user_avatar').files[0]
      );
      $.ajax({
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        url: '/save_profile_avatar',
        data: formData,
      });
    };

  document.documentElement.style.setProperty('--rooms_display', `flex`);
  document.querySelector('.search_field').onfocus = function (e) {
    // setTimeout(function () {
    //   // document.querySelector('.search_field').focus({ preventScroll: true });
    //   window.scrollTo(0, 100);
    // }, 1000);
    // e.preventDefault();
    // e.target.focus({ preventScroll: true });
    // document.documentElement.style.setProperty('--rooms_display', `none`);
  };

  document.querySelector('.search_field').onblur = function () {
    if (
      document.querySelector('.search_field').value.replace(/\s/g, '').length ==
      0
    )
      document.documentElement.style.setProperty('--rooms_display', `flex`);
  };

  document.querySelector('.search_field').oninput = function () {
    if ($('.search_field').val().replace(/\s/g, '').length) {
      if (!searchDivPlaceHolder.classList.contains('input'))
        searchDivPlaceHolder.classList.add('input');
      //                document.querySelector(".users_search").setAttribute("style", "display: flex");
      if (chatSocket_user != null && chatSocket_user.readyState) {
        document.documentElement.style.setProperty('--rooms_display', `none`);
        getUsers(document.querySelector('.search_field').value);
      }
    } else {
      //   document.documentElement.style.setProperty('--rooms_display', `flex`);
      if (searchDivPlaceHolder.classList.contains('input'))
        searchDivPlaceHolder.classList.remove('input');
      document
        .querySelectorAll('.users_full_form.search')
        .forEach(function (e) {
          e.remove();
        });
    }
  };

  const search_cross = document.querySelector('.search_cross_div');
  search_cross.onmouseup = search_cross.ontouchstart = function () {
    document.querySelector('.search_field').value = '';
    // document.documentElement.style.setProperty('--rooms_display', `flex`);
  };

  document.getElementById('file').addEventListener('change', function (e) {
    if (e.target.files[0]) {
      // $('.textarea').focus();
    }
  });

  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });

  window.addEventListener('resize', () => {
    adapt();
  });

  $(document).ready(adapt);

  document
    .querySelector('#color_chat_change')
    .addEventListener('input', function (e) {
      var room_BG_color_hex =
        document.querySelector('#color_chat_change').value;
      document.documentElement.style.setProperty(
        '--input_submit_color',
        `${room_BG_color_hex}`
      );
      document.documentElement.style.setProperty(
        '--dark_mode_color',
        `${room_BG_color_hex}`
      );
      document.documentElement.style.setProperty(
        '--slider_shadow_degree',
        `${room_BG_color_hex}`
      );
      document.documentElement.style.setProperty(
        '--slider_shadow_degree_bubble',
        `${pSBC(0.5, room_BG_color_hex)}`
      );

      document.documentElement.style.setProperty(
        '--myColor1',
        pSBC(-0.6, room_BG_color_hex)
      );
      document.documentElement.style.setProperty(
        '--myColor2',
        pSBC(0, room_BG_color_hex)
      );
      document.documentElement.style.setProperty(
        '--myColor3',
        pSBC(-0.8, room_BG_color_hex)
      );

      document.documentElement.style.setProperty(
        '--selected_chat_color',
        `${pSBC(-0.8, room_BG_color_hex)}`
      );
      /*            document.querySelector(".darker").style.cssText = "background: red;";
            for(el in document.querySelectorAll(".darker"))
                document.querySelectorAll(".darker")[el].style.background = room_BG_color_hex;
/*            document.querySelector(".message").setAttribute("style", "background: blue;");*/
    });

  document
    .querySelector('#color_chat_change')
    .addEventListener('change', function (e) {
      setCookie('room_BG_color_hex', this.value, 7);
      //            document.querySelector(".room_div").setAttribute('style', '--myColor1: ' + pSBC(-0.6, room_BG_color_hex) + '; --myColor2: ' + pSBC(-0.4, room_BG_color_hex) + '; --myColor3: ' + room_BG_color_hex + ';')
    });

  function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
  }

  function decode_utf8(s) {
    return decodeURIComponent(escape(s));
  }

  const syntheticEvent = new WheelEvent('syntheticWheel', {
    deltaY: 4,
    deltaMode: 0,
  });

  // document.querySelector('.tab').addEventListener(
  //   'wheel',
  //   (evt) => {
  //     evt.preventDefault();
  //     document.querySelector('.tab').scrollLeft += Math.sign(evt.deltaY) * 20;
  //   },
  //   { passive: false }
  // );

  document.querySelector('#dark_mode').onmousedown = function () {
    if (getCookie('theme_mode') == 'L') setCookie('theme_mode', 'D', 7);
    else if (getCookie('theme_mode') == 'D') setCookie('theme_mode', 'L', 7);
    set_theme();
  };

  document
    .getElementById('dark_mode_check')
    .addEventListener('click', function (event) {
      event.preventDefault();
    });

  document
    .getElementById('reduce_animations_check')
    .addEventListener('click', function (event) {
      // this.checked = !this.checked;
    });

  if (getCookie('theme_mode') == null) setCookie('theme_mode', 'D', 1);

  $(document).ready(set_theme);

  function set_theme(theme_mode) {
    var message_color = '#FFF';
    var main_color = '#000';
    var darker_ = '#FFF';
    var attachment_tabs = '#EEE';
    if (getCookie('theme_mode') == 'L') {
      document.documentElement.style.setProperty(
        '--message_color',
        `${message_color}`
      );
      document.documentElement.style.setProperty(
        '--message_font_color',
        `${main_color}`
      );
      document.documentElement.style.setProperty('--darker_', `${darker_}`);
      document.documentElement.style.setProperty(
        '--user_font_color',
        `${main_color}`
      );
      document.documentElement.style.setProperty(
        '--textarea_font',
        `${main_color}`
      );
      document.documentElement.style.setProperty(
        '--attachment_tabs',
        `${attachment_tabs}`
      );
      document.documentElement.style.setProperty(
        '--attachment_tabs_font',
        `${main_color}`
      );
      themeMeta.content = '#FFF';
      document
        .querySelector('.settings')
        .setAttribute('style', 'background: #EEE;');
      document
        .querySelector('body')
        .setAttribute('style', 'background-color: #FFF;');
      document
        .querySelector('#opponent_title_name')
        .setAttribute('style', 'background-color: #FFFFFFE6;');
      document.querySelector('#name').setAttribute('style', 'color: #000;');
      document
        .querySelector('.send_div')
        .setAttribute('style', 'background-color: #FFFFFFE6;');
      document
        .querySelector('.users_search')
        .setAttribute('style', 'background-color: #FFF;');
      document
        .querySelector('.search_div')
        .setAttribute('style', 'background-color: #FFF;');
      // document
      //   .querySelector('.search_field')
      //   .setAttribute('style', 'background-color: #EEE; color: #000;');
      document
        .querySelector('.attachments')
        .setAttribute('style', 'background-color: #FFF;');
      document
        .querySelector('.settings_menu')
        .setAttribute('style', 'background-color: #FFF;');
      // document
      //   .querySelector('.scroll_down')
      //   .setAttribute('style', 'background: #EEE;');
      document.querySelector('#dark_mode_check').checked = false;
    } else if (getCookie('theme_mode') == 'D') {
      message_color = 'rgba(28,28, 28)';
      main_color = '#FFF';
      darker_ = pSBC(-0.3, getCookie('room_BG_color_hex'));
      // darker_ = '#7469a6ff';
      attachment_tabs = '##1E1E1E';
      document.documentElement.style.setProperty(
        '--message_color',
        `${message_color}`
      );
      document.documentElement.style.setProperty(
        '--message_font_color',
        `${main_color}`
      );
      document.documentElement.style.setProperty('--darker_', `${darker_}`);
      document.documentElement.style.setProperty(
        '--user_font_color',
        `${main_color}`
      );
      document.documentElement.style.setProperty(
        '--textarea_font',
        `${main_color}`
      );
      document.documentElement.style.setProperty(
        '--attachment_tabs',
        `${attachment_tabs}`
      );
      document.documentElement.style.setProperty(
        '--attachment_tabs_font',
        `${main_color}`
      );
      // themeMeta.content = '#000000';
      document
        .querySelector('.settings')
        .setAttribute('style', 'background: #222;');
      document
        .querySelector('body')
        .setAttribute('style', 'background-color: #000000;');
      //   document
      //     .querySelector('#opponent_title_name')
      //     .setAttribute('style', 'background-color: #1E1E1EE6;');
      document.querySelector('#name').setAttribute('style', 'color: white;');
      //   document
      //     .querySelector('.send_div')
      //     .setAttribute('style', 'background-color: #1E1E1EE6;');
      document
        .querySelector('.users_search')
        .setAttribute('style', 'background-color: #000000;');
      // document
      //   .querySelector('.search_div')
      //   .setAttribute('style', 'background-color: #00000099;');
      //   document
      //     .querySelector('.search_field')
      //     .setAttribute('style', 'background-color: rgba(41,49,51);');
      document
        .querySelector('.attachments')
        .setAttribute('style', 'background-color: #000000;');
      document
        .querySelector('.settings_menu')
        .setAttribute('style', 'background-color: #000000;');
      // document
      //   .querySelector('.scroll_down')
      //   .setAttribute('style', 'background: rgb(25,25,25, 0.8);');
      document.querySelector('#dark_mode_check').checked = true;
    }
  }
  if (getCookie('room_BG_shadow') == undefined) {
    setCookie('room_BG_shadow', '45', 7);
  }
  if (getCookie('room_BG_color_hex') == undefined) {
    setCookie('room_BG_color_hex', '#6c47ff', 7);
  }
  document.querySelector('#color_chat_change').value = room_BG_color_hex =
    getCookie('room_BG_color_hex');
  document.querySelector('#shadow_degree_chat').value = shadow_degree =
    getCookie('room_BG_shadow');
  // setTimeout(function () {
  //   document
  //     .querySelector('.chat-background-image')
  //     .style.setProperty('--shadow_degree', `${shadow_degree}deg`);
  // }, 0);
  document.documentElement.style.setProperty(
    '--shadow_degree',
    `${shadow_degree}deg`
  );
  document.documentElement.style.setProperty(
    '--slider_shadow_degree',
    `${room_BG_color_hex}`
  );
  document.documentElement.style.setProperty(
    '--slider_shadow_degree_bubble',
    `${pSBC(0.5, room_BG_color_hex)}`
  );
  document.documentElement.style.setProperty(
    '--input_submit_color',
    `${room_BG_color_hex}`
  );
  document.documentElement.style.setProperty(
    '--dark_mode_color',
    `${room_BG_color_hex}`
  );
  document.documentElement.style.setProperty(
    '--room_BG_color_hex',
    `${room_BG_color_hex}`
  );

  document.documentElement.style.setProperty(
    '--myColor1',
    pSBC(-0.6, room_BG_color_hex)
  );
  document.documentElement.style.setProperty(
    '--myColor2',
    pSBC(0, room_BG_color_hex)
  );
  document.documentElement.style.setProperty(
    '--myColor3',
    pSBC(-0.8, room_BG_color_hex)
  );
  //   document
  //     .querySelector('.chat-background-image')
  //     .setAttribute(
  //       'style',
  //       '--myColor1: #000; --myColor2: #000; --myColor3: #000; --myColor3: #000;'
  //     );
  document.documentElement.style.setProperty(
    '--selected_chat_color',
    `${pSBC(-0.8, room_BG_color_hex)}`
  );

  click = true;

  $('.reloadLocationButton').click(function () {
    location.reload();
  });

  document
    .querySelector('#opponent_title_name')
    .addEventListener('click', (e) => {
      if (e.target.closest('.go_home_page') || e.target.closest('.arrow-left'))
        return;
      document.querySelector('.attachments').classList.add('active');
      document.querySelector('.close-menu').classList.add('close-menu-active');
      document.querySelector('.send_div_class').classList.add('active');
      document.querySelector('.room_body').classList.add('active');
      document.querySelector('#opponent_title_name').classList.add('active');
      // document
      //   .querySelector('.chat-background-image')
      //   .classList.add('active');
    });

  document.querySelector('.close-menu').addEventListener('click', (e) => {
    document.querySelector('.attachments').classList.remove('active');
    document.querySelector('.close-menu').classList.remove('close-menu-active');
    document.querySelector('.send_div_class').classList.remove('active');
    document.querySelector('.room_body').classList.remove('active');
    document.querySelector('#opponent_title_name').classList.remove('active');
    // document.querySelector('.chat-background-image').classList.remove('active');
  });

  $(document).on('mousedown', function (e) {
    // if (
    //   !$(e.target).closest('.settings_menu').length &&
    //   e.target != document.querySelector('.dropbtn')
    // ) {
    //   document.querySelector('.settings_menu').classList.remove('active');
    // }

    if (!$(e.target).closest('#create_new_group_room').length) {
      document
        .querySelector('#create_new_group_room')
        .classList.remove('active');
      document
        .querySelector('#create_new_group_room')
        .classList.remove('active');
    }

    if (!$(e.target).closest('#create_new_channel_room').length) {
      document
        .querySelector('#create_new_channel_room')
        .classList.remove('active');
      document
        .querySelector('#create_new_channel_room')
        .classList.remove('active');
    }

    if (!$(e.target).closest('.calendar_div').length) {
      document.querySelector('.calendar_div').style.display = 'none';
    }

    if (!e.target.classList.contains('mes_img')) {
      document.querySelector('#media_display').style.display = 'none';
    }

    e.stopPropagation();
  });

  document.querySelector('#appearance_exit').onclick = function () {
    document.querySelector('.settings').classList.remove('active');
  };

  $('#settings').click(function () {
    document.querySelector('.settings').classList.add('active');
    // document.querySelector('.settings_menu').classList.remove('active');
    // document.querySelector('#img01').removeAttribute('src');
    // document.querySelector('#myModal').style.display = 'block';
    // document.querySelector('.settings').classList.add('active');
    // document.querySelector('.settings').style.display = 'block';
  });

  $('#create_new_group').click(function () {
    document.querySelector('#creation_group_GIVE_A_NAME_input').focus({
      preventScroll: true,
    });
    // document.querySelector('.settings_menu').classList.remove('active');
    // document.querySelector('#img01').removeAttribute('src');
    // document.querySelector('#myModal').style.display = 'block';
    document.querySelector('#create_new_group_room').classList.add('active');
  });

  $('#create_new_channel').click(function () {
    // document.querySelector('.settings_menu').classList.remove('active');
    document.querySelector('#img01').removeAttribute('src');
    document.querySelector('#myModal').style.display = 'block';
    document.querySelector('#create_new_channel_room').classList.add('active');
  });

  const daysTag = document.querySelector('.days'),
    currentDate = document.querySelector('.current-date'),
    prevNextIcon = document.querySelectorAll('.icons span');

  let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

  const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
      lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
      lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
      lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
    let liTag = '';

    for (let i = firstDayofMonth; i > 0; i--) {
      liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
      let isToday =
        i === date.getDate() &&
        currMonth === new Date().getMonth() &&
        currYear === new Date().getFullYear()
          ? 'active'
          : '';
      liTag += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
      liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
    daysTag.querySelectorAll('li:not(.inactive)').forEach(function (e) {
      e.onclick = function () {
        current_date = document.querySelector('.current-date');
        year = current_date.textContent.slice(
          current_date.textContent.lastIndexOf(' ') + 1
        );
        month = (
          months.indexOf(
            current_date.textContent.slice(
              0,
              current_date.textContent.lastIndexOf(' ')
            )
          ) + 1
        ).toString();
        month = month.length == 2 ? month : '0' + month;
        day = e.textContent.length == 2 ? e.textContent : '0' + e.textContent;
        final_date = year + '-' + month + '-' + day;
        block_to_scroll = block_date_dict[final_date];

        if (block_to_scroll == undefined) {
          keys = Object.keys(block_date_dict);
          for (date = keys.length - 1; date >= 0; --date) {
            if (keys[date] > final_date) {
              block_to_scroll = block_date_dict[keys[date]];
              break;
            }
          }
        }

        block_to_scroll.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        block_to_scroll.classList.add('active');
        setTimeout(function () {
          block_to_scroll.classList.remove('active');
        }, 500);

        document.querySelector('.calendar_div').style.display = 'none';
        document.querySelector('#myModal').style.display = 'none';
      };
    });
  };
  renderCalendar();

  prevNextIcon.forEach((icon) => {
    icon.addEventListener('click', () => {
      currMonth = icon.id === 'prev' ? currMonth - 1 : currMonth + 1;

      if (currMonth < 0 || currMonth > 11) {
        date = new Date(currYear, currMonth, new Date().getDate());
        currYear = date.getFullYear();
        currMonth = date.getMonth();
      } else {
        date = new Date();
      }
      renderCalendar();
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var lazyloadImages = document.querySelectorAll('img.lazy');
    var lazyloadThrottleTimeout;

    function lazyload() {
      if (lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
      }

      lazyloadThrottleTimeout = setTimeout(function () {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function (img) {
          if (img.offsetTop < window.innerHeight + scrollTop) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
          }
        });
        if (lazyloadImages.length == 0) {
          document.removeEventListener('scroll', lazyload);
          window.removeEventListener('resize', lazyload);
          window.removeEventListener('orientationChange', lazyload);
        }
      }, 20);
    }

    document.addEventListener('scroll', lazyload);
    window.addEventListener('resize', lazyload);
    window.addEventListener('orientationChange', lazyload);
  });
};

//    function _(el) {
//      return document.getElementById(el);
//    }
//
//    function uploadFile() {
//      var file = _("file").files[0];
//      // alert(file.name+" | "+file.size+" | "+file.type);
//      var formdata = new FormData();
//      formdata.append("file", file);
//      formdata.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
//      var ajax = new XMLHttpRequest();
//      ajax.upload.addEventListener("progress", progressHandler, false);
//      ajax.addEventListener("load", completeHandler, false);
//      ajax.addEventListener("error", errorHandler, false);
//      ajax.addEventListener("abort", abortHandler, false);
//      ajax.open("POST", "/send");
//      ajax.send(formdata);
//    }
//
//    function progressHandler(event) {
//      _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
//      var percent = (event.loaded / event.total) * 100;
//      _("progressBar").value = Math.round(percent);
//      _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
//    }
//
//    function completeHandler(event) {
//      _("status").innerHTML = event.target.responseText;
//      _("progressBar").value = 0; //wil clear progress bar after successful upload
//    }
//
//    function errorHandler(event) {
//      _("status").innerHTML = "Upload Failed";
//    }
//
//    function abortHandler(event) {
//      _("status").innerHTML = "Upload Aborted";
//    }

function adapt() {
  document.querySelector('.room_body').scrollTo({
    top: document.querySelector('.room_body').scrollTop,
    behavior: 'smooth',
  });

  let vw = window.innerWidth;
  allow = window.innerWidth - 400;
  if (vw <= 1700) {
    document.querySelector('.main_chat_window').style.width = allow + 'px';
  }
  if (vw <= 768) {
    document
      .querySelector('.go_home_page')
      .setAttribute('style', 'display: unset;');
    document.querySelector('#name').style.textIndent = '0px';
    // document.querySelector(".main_chat_window").setAttribute("style","width: 100vw;");
    document.querySelector('.main_chat_window').style.width = '100vw';
    if (document.querySelector('#room_id').value != 0) {
      //   document
      //     .querySelector('.choose_list')
      //     .setAttribute('style', 'display: none;');
    } else {
      document
        .querySelector('.choose_list')
        .setAttribute('style', 'display: flex;');
      // document.querySelector(".main_chat_window").setAttribute("style","display: none");
      // document.querySelector(".main_chat_window").style.display = "none";
    }
  }
  if (vw > 768) {
    document
      .querySelector('.go_home_page')
      .setAttribute('style', 'display: none;');
    // document.querySelector(".main_chat_window").setAttribute("style","width: " + allow + "px;");
    document.querySelector('.main_chat_window').style.width = allow + 'px';
    document
      .querySelector('.choose_list')
      .setAttribute('style', 'display: flex;');
  }
  if (vw > 1700) {
    document
      .querySelector('.main_chat_window')
      .setAttribute('style', 'width: 1200;');
    document
      .querySelector('.choose_list')
      .setAttribute('style', 'max-width: 400;');
    document
      .querySelector('.choose_list')
      .setAttribute('style', 'min-width: 400;');
  }
}

jQuery(function ($) {
  $(document).on('mousedown', '.users_full_form', function (e) {
    if (
      isSupported() &&
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission();
    }
    document.querySelector('#post-form').classList.remove('hidden');
    var $self = $(this);

    if ($self.is('.btn-disabled')) {
      return;
    }
    if ($self.closest('.users_full_form')) {
      e.stopPropagation();
    }

    var initPos = $self.css('position'),
      offs = $self.offset(),
      // Для touch событий
      touch =
        e.originalEvent && e.originalEvent.touches
          ? e.originalEvent.touches[0]
          : e,
      x = touch.pageX - offs.left,
      y = touch.pageY - offs.top,
      dia = Math.min(this.offsetHeight, this.offsetWidth, 100),
      $ripple = $('<div/>', { class: 'ripple', appendTo: $self });

    if (!initPos || initPos === 'static') {
      $self.css({ position: 'relative' });
    }

    var $wave = $('<div/>', {
      class: 'rippleWave',
      css: {
        background: $self.data('ripple'),
        width: dia,
        height: dia,
        left: x - dia / 2,
        top: y - dia / 2,
      },
      appendTo: $ripple,
    });

    // Обработка окончания анимации с несколькими событиями
    function removeRipple() {
      $ripple.remove();
      $wave.off('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd');
    }

    $wave.on(
      'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd',
      removeRipple
    );

    // Fallback таймер на случай если события не сработают
    setTimeout(removeRipple, 1000);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const leftMenuFooter = document.querySelector('.left-menu-footer');
  const leftMenuFooterPadding = document.querySelector(
    '.left-menu-footer-padding'
  );
  const chatsTab = document.querySelector('.left-menu-footer-chats');
  const settingsTab = document.querySelector('.left-menu-footer-settings');
  const indicator = document.querySelector('.tab-indicator');
  const settingsMenu = document.querySelector('.settings_menu');
  const chatsMenu = document.querySelector('.users_search');

  let startX = 0;
  let currentPosition = 0;

  function switchTab(activeTab) {
    chatsTab.classList.remove('active');
    settingsTab.classList.remove('active');

    if (activeTab === 'chats') {
      chatsTab.classList.add('active');

      indicator.classList.remove('toggle');
      indicator.classList.add('toggle2');
      currentPosition = 0;
      updateIndicatorPosition();
      if (chatsMenu) chatsMenu.classList.add('active');
      if (settingsMenu) settingsMenu.classList.remove('active');
    } else {
      settingsTab.classList.add('active');
      indicator.classList.remove('toggle2');
      indicator.classList.add('toggle');

      currentPosition = calcMaxTranslate();
      updateIndicatorPosition();
      if (chatsMenu) chatsMenu.classList.remove('active');
      if (settingsMenu) settingsMenu.classList.add('active');
    }
  }

  function calcMaxTranslate() {
    const containerWidth = leftMenuFooter.offsetWidth;
    const indicatorWidth = indicator.offsetWidth;
    return containerWidth * 1.05 - (indicatorWidth - 5) * 1.2;
  }

  function updateIndicatorPosition() {
    indicator.style.translate = `${currentPosition}px 0`;
  }

  function getActiveTabFromPosition() {
    const containerWidth = leftMenuFooter.offsetWidth;
    const threshold = containerWidth / 2;
    const currentPos = currentPosition + indicator.offsetWidth / 2;
    return currentPos < threshold ? 'chats' : 'settings';
  }

  chatsTab.addEventListener('touchstart', () => switchTab('chats'), {
    passive: true,
  });
  chatsTab.addEventListener('mousedown', () => switchTab('chats'));
  settingsTab.addEventListener('touchstart', () => switchTab('settings'), {
    passive: true,
  });
  settingsTab.addEventListener('mousedown', () => switchTab('settings'));

  indicator.addEventListener(
    'touchstart',
    function (e) {
      e.preventDefault();
      const touch = e.touches[0];
      startX = touch.clientX - currentPosition;
      this.classList.add('active');
      leftMenuFooterPadding.classList.add('active');
      this.style.translate = `${currentPosition}px 0`;
      this.style.transform = `scale(1.2)`;
    },
    {
      passive: true,
    }
  );

  let lastPosition = 0;
  let lastTime = 0;
  let velocity = 0;
  let lastVelocity = 0;
  let returnTimer = null;
  let currentBubbleHeight = 1.2;
  const NORMAL_BUBBLE_HEIGHT = 1.3;
  const MIN_BUBBLE_HEIGHT = 1;
  const VELOCITY_THRESHOLD = 0.15;
  const VELOCITY_CHANGE_THRESHOLD = 0.95; // порог изменения скорости (30% от предыдущей скорости)
  const RETURN_DELAY = 100;

  function tabMove(e) {
    e.preventDefault();
    if (!e.touches[0]) return;
    // createDisplacement();

    const touch = e.touches[0];
    const newPosition = touch.clientX - startX;
    const maxTranslate = calcMaxTranslate();

    currentPosition = Math.max(0, Math.min(newPosition, maxTranslate));
    setTimeout(() => {
      updateIndicatorPosition();
    }, 100);

    // Расчет скорости движения
    const currentTime = Date.now();
    if (lastTime > 0) {
      const deltaTime = currentTime - lastTime;
      const deltaPosition = Math.abs(newPosition - lastPosition);
      velocity = deltaPosition / deltaTime;
    }
    if (velocity === Infinity) return;

    lastPosition = newPosition;
    lastTime = currentTime;

    // Очистка предыдущего таймера
    if (returnTimer) {
      clearTimeout(returnTimer);
      returnTimer = null;
    }

    // Проверка на значительное изменение скорости
    let shouldUpdateHeight = false;

    if (lastVelocity === 0) {
      // Первое измерение - всегда обновляем
      shouldUpdateHeight = true;
    } else {
      // Проверяем, изменилась ли скорость значительно
      const velocityChange = Math.abs(velocity - lastVelocity);
      const relativeChange = velocityChange / lastVelocity;
      if (relativeChange > VELOCITY_CHANGE_THRESHOLD) {
        shouldUpdateHeight = true;
      }
      // Также обновляем если пересекаем порог скорости в любую сторону
      else if (
        (lastVelocity <= VELOCITY_THRESHOLD && velocity > VELOCITY_THRESHOLD) ||
        (lastVelocity > VELOCITY_THRESHOLD && velocity <= VELOCITY_THRESHOLD)
      ) {
        shouldUpdateHeight = true;
      }
    }

    // Расчет высоты пузыря только если скорость значительно изменилась
    if (shouldUpdateHeight) {
      let targetBubbleHeight = NORMAL_BUBBLE_HEIGHT;

      if (velocity > VELOCITY_THRESHOLD) {
        const speedFactor = Math.min(
          1,
          (velocity - VELOCITY_THRESHOLD) / VELOCITY_THRESHOLD
        );
        targetBubbleHeight =
          NORMAL_BUBBLE_HEIGHT -
          (NORMAL_BUBBLE_HEIGHT - MIN_BUBBLE_HEIGHT) * speedFactor;
      }
      currentBubbleHeight = targetBubbleHeight;
      lastVelocity = velocity; // Сохраняем текущую скорость как эталон
    }
    this.style.transform = `scale(1.2, ${currentBubbleHeight})`;

    // returnTimer = setTimeout(() => {
    //   returnToNormalHeight();
    // }, RETURN_DELAY);
  }

  function returnToNormalHeight() {
    indicator.style.transform = `scale(1.2, ${NORMAL_BUBBLE_HEIGHT})`;
    currentBubbleHeight = NORMAL_BUBBLE_HEIGHT;
    velocity = 0;
    lastVelocity = 0;
    lastTime = 0;
  }

  // indicator.addEventListener('touchmove', throttle(tabMove, 16));
  indicator.addEventListener('touchmove', throttle(tabMove, 16), {
    passive: true,
  });
  function tabEnd() {
    // this.style.transition = 'transform 0.3s ease';
    this.style.translate = `${currentPosition}px 0`;
    this.style.transform = `scale(1)`;
    this.classList.remove('active');
    leftMenuFooterPadding.classList.remove('active');
    const activeTab = getActiveTabFromPosition();
    switchTab(activeTab);
  }

  indicator.addEventListener('touchend', tabEnd);
  indicator.addEventListener('touchcancel', tabEnd);

  // switchTab('chats');
});

function logoutUser(button) {
  const logoutUrl = button.getAttribute('data-logout-url');
  const csrfToken = button.getAttribute('data-csrf-token');
  const originalText = button.textContent;

  document.getElementById('logout-span').textContent = 'Logging out...';
  button.disabled = true;

  fetch(logoutUrl, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': csrfToken,
    },
  })
    .then((response) => {
      window.location.reload();
    })
    .catch((error) => {
      console.error('Logout error:', error);
      window.location.reload();
    });
}

function generateGradientColors(hexColor) {
  // Преобразуем HEX в RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Преобразуем RGB в HEX
  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Корректируем цвет (осветляем или затемняем)
  function adjustColor(rgb, factor) {
    return {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor))),
    };
  }

  // Создаем аналогичный цвет (сдвигаем hue)
  function createAnalogous(rgb, hueShift) {
    // Конвертируем RGB в HSL
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // ахроматический
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    // Сдвигаем hue
    h = (h + hueShift / 360) % 1;
    if (h < 0) h += 1;

    // Конвертируем обратно в RGB
    function hueToRgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;

    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  const baseRgb = hexToRgb(hexColor);
  if (!baseRgb) {
    throw new Error('Неверный HEX формат цвета');
  }

  // Генерируем 4 гармоничных цвета
  const gradientColors = [];

  // 1. Исходный цвет (немного осветленный)
  const color1 = adjustColor(baseRgb, 1.1);
  gradientColors.push(rgbToHex(color1.r, color1.g, color1.b));

  // 2. Исходный цвет
  gradientColors.push(hexColor);

  // 3. Аналогичный цвет (сдвиг hue на 30 градусов)
  const analogous1 = createAnalogous(baseRgb, 30);
  gradientColors.push(rgbToHex(analogous1.r, analogous1.g, analogous1.b));

  // 4. Дополнительный цвет (сдвиг hue на 150 градусов)
  const analogous2 = createAnalogous(baseRgb, 150);
  gradientColors.push(rgbToHex(analogous2.r, analogous2.g, analogous2.b));

  return gradientColors;
}

// Пример использования:
// Возвращает массив из 4 HEX цветов для градиента

class StaticBackgroundFixedZoom {
  constructor() {
    this.gradientCanvas = document.getElementById('gradient-canvas');
    this.patternCanvas = document.getElementById('pattern-canvas');

    this.gradientCtx = this.gradientCanvas.getContext('2d');
    this.patternCtx = this.patternCanvas.getContext('2d');

    this.patternImage = new Image();
    let room_BG_color_hex = getCookie('room_BG_color_hex');
    if (getCookie('room_BG_shadow') == undefined) {
      setCookie('room_BG_shadow', '45', 7);
    }
    let gradientColors = [];
    let shadow_degree = getCookie('room_BG_shadow');
    if (!Number.isInteger(shadow_degree)) {
      shadow_degree = 45;
    }
    try {
      gradientColors = Array.from(generateGradientColors(room_BG_color_hex));
    } catch (e) {
      room_BG_color_hex = '#6c47ff';
      gradientColors = Array.from(generateGradientColors(room_BG_color_hex));
    }

    if (getCookie('room_BG_color_hex') == undefined) {
      setCookie('room_BG_color_hex', '#6c47ff', 7);
      room_BG_color_hex = '#6c47ff';
    }
    // console.log(room_BG_color_hex);

    this.FIXED_HEX_1 = pSBC(-0.6, room_BG_color_hex);
    this.FIXED_HEX_2 = pSBC(0, room_BG_color_hex);
    this.FIXED_HEX_3 = pSBC(-0.8, room_BG_color_hex);

    // this.FIXED_HEX_1 = gradientColors[1];
    // this.FIXED_HEX_2 = gradientColors[2];
    // this.FIXED_HEX_3 = gradientColors[3];
    this.FIXED_SHADOW = shadow_degree;
    this.FIXED_SCALE = 2;

    this.RENDER_QUALITY = 2;
    this.PATTERN_QUALITY = 2;

    this.gradientCache = {
      canvas: null,
      shadow: null,
      colors: null,
    };

    this.resizeTimeout = null;
    this.redrawTimeout = null;

    this.init();
  }

  setupEventListeners() {
    let shadowTimeout;
    document.querySelector('#shadow_degree_chat').oninput = (e) => {
      clearTimeout(shadowTimeout);
      shadowTimeout = setTimeout(() => {
        this.FIXED_SHADOW = document.querySelector('#shadow_degree_chat').value;
        setCookie('room_BG_shadow', this.FIXED_SHADOW, 7);
        document.documentElement.style.setProperty(
          '--shadow_degree',
          `${this.FIXED_SHADOW}deg`
        );

        this.drawGradient();
        this.drawPatternMask();
      }, 16);
    };

    let colorTimeout;
    document.querySelector('#color_chat_change').oninput = (e) => {
      clearTimeout(colorTimeout);
      colorTimeout = setTimeout(() => {
        const newColor = document.querySelector('#color_chat_change').value;
        setCookie('room_BG_color_hex', newColor, 7);

        this.FIXED_HEX_1 = pSBC(-0.6, newColor);
        this.FIXED_HEX_2 = pSBC(0, newColor);
        this.FIXED_HEX_3 = pSBC(-0.8, newColor);

        this.gradientCache.canvas = null;
        this.createPatternCache.canvas = null;
        this.drawGradient();
        this.drawPatternMask();
      }, 16);
    };
  }

  async init() {
    this.patternImage.src = 'static/SVG/PATTERNS/pattern-29.svg';
    this.patternImage.setAttribute('preserveAspectRatio', 'none');

    await new Promise((resolve) => {
      this.patternImage.onload = () => {
        this.createPatternCache();
        resolve();
      };
    });

    this.setupEventListeners();
    this.resize();

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.resize(), 100);
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resize(), 150);
    });
  }

  createPatternCache() {
    const baseSize = 400 * this.FIXED_SCALE * this.PATTERN_QUALITY;
    const cacheCanvas = document.createElement('canvas');
    const cacheCtx = cacheCanvas.getContext('2d');

    cacheCanvas.width = baseSize;
    cacheCanvas.height = baseSize;

    cacheCtx.imageSmoothingEnabled = true;
    cacheCtx.imageSmoothingQuality = 'medium';

    cacheCtx.drawImage(this.patternImage, 0, 0, baseSize, baseSize);

    this.patternCache = {
      canvas: cacheCanvas,
      scale: this.FIXED_SCALE,
      quality: this.PATTERN_QUALITY,
    };
  }

  resize() {
    const mainChatWindow = document.querySelector('.main_chat_window');
    // console.log(mainChatWindow.clientWidth);
    const width = mainChatWindow.clientWidth;
    const height = mainChatWindow.clientHeight;

    const scaleFactor = (window.devicePixelRatio || 1) * this.RENDER_QUALITY;

    [this.gradientCanvas, this.patternCanvas].forEach((canvas) => {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      canvas.width = Math.floor(width * scaleFactor);
      canvas.height = Math.floor(height * scaleFactor);

      const ctx = canvas.getContext('2d');
      ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
    });

    this.drawGradient();
    this.drawPatternMask();
  }

  drawGradient() {
    const cacheKey = `${this.FIXED_SHADOW}_${this.FIXED_HEX_1}_${this.FIXED_HEX_2}_${this.FIXED_HEX_3}`;

    if (
      this.gradientCache.canvas &&
      this.gradientCache.shadow === this.FIXED_SHADOW &&
      this.gradientCache.colors === cacheKey
    ) {
      const ctx = this.gradientCtx;
      const width = parseFloat(this.gradientCanvas.style.width);
      const height = parseFloat(this.gradientCanvas.style.height);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(this.gradientCache.canvas, 0, 0, width, height);
      return;
    }

    const ctx = this.gradientCtx;
    const width = parseFloat(this.gradientCanvas.style.width);
    const height = parseFloat(this.gradientCanvas.style.height);

    const dpr = (window.devicePixelRatio || 1) * this.RENDER_QUALITY;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(
      0,
      0,
      Math.cos((this.FIXED_SHADOW * Math.PI) / 180) * width,
      Math.sin((this.FIXED_SHADOW * Math.PI) / 180) * height
    );

    gradient.addColorStop(0, this.FIXED_HEX_1);
    gradient.addColorStop(0.35, this.FIXED_HEX_2);
    gradient.addColorStop(1, this.FIXED_HEX_3);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    this.cacheGradient(width, height, cacheKey);
  }

  cacheGradient(width, height, cacheKey) {
    const cacheCanvas = document.createElement('canvas');
    const cacheCtx = cacheCanvas.getContext('2d');

    cacheCanvas.width = width;
    cacheCanvas.height = height;

    const gradient = cacheCtx.createLinearGradient(
      0,
      0,
      Math.cos((this.FIXED_SHADOW * Math.PI) / 180) * width,
      Math.sin((this.FIXED_SHADOW * Math.PI) / 180) * height
    );

    gradient.addColorStop(0, this.FIXED_HEX_1);
    gradient.addColorStop(0.35, this.FIXED_HEX_2);
    gradient.addColorStop(1, this.FIXED_HEX_3);

    cacheCtx.fillStyle = gradient;
    cacheCtx.fillRect(0, 0, width, height);

    this.gradientCache = {
      canvas: cacheCanvas,
      shadow: this.FIXED_SHADOW,
      colors: cacheKey,
    };
  }

  drawPatternMask() {
    const ctx = this.patternCtx;
    const width = parseFloat(this.patternCanvas.style.width);
    const height = parseFloat(this.patternCanvas.style.height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);

    const dpr = (window.devicePixelRatio || 1) * this.RENDER_QUALITY;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.globalCompositeOperation = 'source-over';

    const scale = this.FIXED_SCALE;
    const patternSize = 400 * scale;
    const patternWidth = patternSize / (2960 / 1440);
    const patternHeight = patternSize;

    const cols = Math.ceil(width / patternWidth) + 1;
    const rows = Math.ceil(height / patternHeight) + 1;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const posX = x * patternWidth;
        const posY = y * patternHeight;

        if (this.patternCache.canvas) {
          ctx.drawImage(
            this.patternCache.canvas,
            posX,
            posY,
            patternWidth,
            patternHeight
          );
        } else {
          ctx.drawImage(
            this.patternImage,
            posX,
            posY,
            patternWidth,
            patternHeight
          );
        }
      }
    }

    this.applyMask();
  }

  applyMask() {
    const ctx = this.gradientCtx;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.patternCanvas, 0, 0);

    const dpr = (window.devicePixelRatio || 1) * this.RENDER_QUALITY;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const background = new StaticBackgroundFixedZoom();
});
