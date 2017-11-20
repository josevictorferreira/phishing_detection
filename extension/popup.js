// popup.js
/*
[('having_IP_Address', 0.013309623974683937),
 ('Prefix_Suffix', 0.043451074382336925),
 ('having_Sub_Domain', 0.065823832914477159),
 ('SSLfinal_State', 0.30969862106064566),
 ('Domain_registeration_length', 0.013276880856033069),
 ('Request_URL', 0.016514685998827387),
 ('URL_of_Anchor', 0.26476687811669192),
 ('Links_in_tags', 0.050880397441754134),
 ('SFH', 0.020367888263323274),
 ('age_of_domain', 0.015638145761864904),
 ('DNSRecord', 0.012084666018642904),
 ('web_traffic', 0.067561369594475895),
 ('Page_Rank', 0.011236541233798903),
 ('Google_Index', 0.012180437502074613),
 ('Links_pointing_to_page', 0.017604748971183453)]
*/

function getHostname(url) {
  const hostname = (new URL(url)).hostname;
  return hostname;
}

function getProtocol(url) {
  const protocol  = (new URL(url)).protocol;
  return protocol;
}

function subDomain(url) {
  // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
  url = url.replace(new RegExp(/^\s+/),""); // START
  url = url.replace(new RegExp(/\s+$/),""); // END 
  // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
  url = url.replace(new RegExp(/\\/g),"/");
  // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
  url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i),"");
  // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
  url = url.replace(new RegExp(/^www\./i),"");
  // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
  url = url.replace(new RegExp(/\/(.*)/),"");
  // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
  if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
        url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i),"");
  // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
  } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
        url = url.replace(new RegExp(/\.[a-z]{2,4}$/i),"");
  }
  // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
  var subDomain = (url.match(new RegExp(/\./g))) ? true : false;
  return(subDomain);
}

function haveIpAddress(address) {
  r = RegExp('^http[s]?:\/\/((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])');
  if (r.test(address)) {
    return 1;
  }
  return -1;
}

function haveSubdomain(address) {
  if (subDomain(address)) {
    return 1;
  }
  return -1;
}

function havePrefixSuffix(address) {
  var hostname = getHostname(address);
  if (hostname.includes('-')) {
    return 1;
  }
  return -1;
}

function getSslFinalState(url) {
  if (getProtocol(url) != "https:") {
    return 1;
  }
  const certified = checkCertificate(getHostname(url));
  if (certified) {
    return -1;
  }
  return 0;
}

function checkCertificate(url) {
  let address = 'http://0.0.0.0:5000/check_cert';
  var issued = false;
  jQuery.ajax({
    url: address,
    data: {
      url: url
    },
    async: false,
    success: function(result) {
      if (result == '1') {
        issued = true;
      }
    }
  });
  return issued;
}

function getDomainRestristrationLength(url) {
  let address = 'http://whois.domaintools.com/';
  var hasExpiredDate = false;
  jQuery.ajax({
    url: address + getHostname(url),
    async: false,
    success: function(result) {
      td = $(result).find('td:contains(Expires)')[0]
      alert(td)
      if (td) {
        dates = $(td).html().split(' - ');
        alert(dates);
        dateString = dates.filter((date) => date.includes('Expires'));
        alert(dateString)
        dateExpiring = new Date(dateString.split('Expires on ')[1]);
        alert(dateExpiring);
        if ((dateExpiring.getFullYear() - (new Date()).getFullYear()) > 1) {
          alert('Entrou');
          hasExpiredDate = true;
        }
      }
    }
  });
  return hasExpiredDate;
}

function checkUrlFeatures(tabs) {
  let url = tabs[0].url;
  let data = {
    'having_IP_Address': haveIpAddress(url),
    'Prefix_Suffix': havePrefixSuffix(url),
    'having_Sub_Domain': haveSubdomain(url),
    'SSLfinal_State': getSslFinalState(url),
    'Domain_registeration_length': getDomainRestristrationLength(url),
  };
  alert(JSON.stringify(data));
} 

function runSwitchjs() {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, checkUrlFeatures);
  chrome.tabs.executeScript({
    file: 'switch.js'
  });
}

document.getElementById('clickme').addEventListener('click', runSwitchjs);