<?php
//FOR POST METHODS

$URL="https://accounts.google.com/o/oauth2/token";

/** XMLHttpRequest PHP Proxy
 * @author          Andrea Giammarchi
 * @blog            http://webreflection.blogspot.com/
 * @license         Mit Style License
 * @requires        curl and Apache webserver
 * @description     basic authentication, GET, POST, HEAD, PUT, DELETE, others requests types.
 *                  Nothing to do on the client side, except put "proxy.php?url=" as request prefix.
 *                  The rest should be like normal in-server interaction
 * @note            DON'T TRY AT HOME
 */

// curl headers array
$headers= array();
foreach(getallheaders() as $key => $value) {
    if (stripos($key,"host")===false) {
        $headers[] = $key.': '.$value;
    }
}


// if request is post ...
$reqs = array();
foreach($_POST as $key => $value) {
    $reqs[] = rawurlencode($key).'='.rawurlencode($value);
}

// init curl session
$call   = $session = curl_init($URL);


curl_setopt($call, CURLOPT_POST, 1);
curl_setopt($call, CURLOPT_POSTFIELDS, implode('&', $reqs));

curl_setopt($call, CURLOPT_HEADER, 1);
curl_setopt($call, CURLOPT_HTTPHEADER, $headers);
curl_setopt($call, CURLOPT_RETURNTRANSFER, true);
curl_setopt($call, CURLOPT_VERBOSE, true);
curl_setopt($call, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0 );


// retrieve the output
$result = explode(PHP_EOL, curl_exec($call));


// nothing else to do so far (this version is not compatible with COMET)
curl_close($call);

//print_r($result); exit;
// for each returned information ...
for($i = 0, $length = count($result), $sent = array(); $i < $length; ++$i){
    // if all headers has been sent ...
    $value=$result[$i];
    if(trim($value) === '') {
        // send the output
        print(implode(PHP_EOL, array_splice($result, ++$i)));
        exit;
    }
    else {
        // ... or send the header (do not overwrite if already sent)
        $tmp = explode(':', $value);
        header($value, !isset($sent[strtolower($tmp[0])]));
        //print "PINTO HEADER: ".$value."\n";
    }
}
exit();

?>