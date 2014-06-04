<?php
function findEntryByID($postLink, $date, $access_token, $id) {
    $url=$postLink;
    $url.="?sq=".rawurlencode("fecha=".$date);
    $url.="&access_token=".rawurlencode($access_token);

    $ch=curl_init($url);

    curl_setopt($ch, CURLOPT_HEADER,0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response=curl_exec($ch);
    curl_close($ch);

    $xmlresp=new SimpleXMLElement($response);


    $xmlresp->registerXPathNamespace("a", "http://www.w3.org/2005/Atom");

    $entry=$xmlresp->xpath("a:entry[a:id/text()='".$id."']");

    return $entry[0];
}

function substituteNode($entry, $tag, $value) {
    $entry->registerXPathNamespace("a", "http://www.w3.org/2005/Atom");
    $entry->registerXPathNamespace("gsx", "http://schemas.google.com/spreadsheets/2006/extended");
    $en2=$entry->xpath("gsx:".$tag);
    $en2[0][0]=$value;
}

/*
 * //book[title/@lang = 'it']

//$xmlresp->registerXPathNamespace("a", "http://www.w3.org/2005/Atom");
//$xmlresp->registerXPathNamespace("gsx", "http://schemas.google.com/spreadsheets/2006/extended");

//$postlinkentry=$xmlresp->xpath("a:link[@rel='http://schemas.google.com/g/2005#post']/@href"); //book[title/@lang = 'it']



 */
