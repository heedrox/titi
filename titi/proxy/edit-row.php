<?php
/**
 * Created by PhpStorm.
 * User: jmarti
 * Date: 1/06/14
 * Time: 22:59
 */
function substituteNode($entry, $tag, $value) {
    $entry->registerXPathNamespace("a", "http://www.w3.org/2005/Atom");
    $entry->registerXPathNamespace("gsx", "http://schemas.google.com/spreadsheets/2006/extended");
    $en2=$entry->xpath("gsx:".$tag);
    $en2[0][0]=$value;
}
$task=json_decode($_REQUEST["task"], true); //true means get associative array instead of obj
/********** FIRST, WE GET ALL THE TASKS OF ONE DAY ****************/

$url="https://spreadsheets.google.com/feeds/list/".$_REQUEST["keyFile"]."/".$_REQUEST["worksheetId"]."/private/full";
$url=$_REQUEST["postLink"];
$url.="?sq=".rawurlencode("fecha=".$task["date"]);
$url.="&access_token=".rawurlencode($_REQUEST["access_token"]);

$ch=curl_init($url);

curl_setopt($ch, CURLOPT_HEADER,0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response=curl_exec($ch);
curl_close($ch);

$xmlresp=new SimpleXMLElement($response);
print($xmlresp->asXML());
print "\n************+\n\n\n";
//exit;

$xmlresp->registerXPathNamespace("a", "http://www.w3.org/2005/Atom");

$entry=$xmlresp->xpath("a:entry[a:id/text()='".$task["id"]."']"); //book[title/@lang = 'it']

//$xmlresp->registerXPathNamespace("a", "http://www.w3.org/2005/Atom");
//$xmlresp->registerXPathNamespace("gsx", "http://schemas.google.com/spreadsheets/2006/extended");

//$postlinkentry=$xmlresp->xpath("a:link[@rel='http://schemas.google.com/g/2005#post']/@href"); //book[title/@lang = 'it']

$tmpentry=new SimpleXMLElement($entry[0]->asXML());
$postlinkentry=$tmpentry->xpath("link[@rel='edit']/@href"); //book[title/@lang = 'it']



$postLink=$postlinkentry[0];

print $postLink;


//$postLink=$_REQUEST["postLink"];

if ($postLink=="") {
    die("no post link!");
}


//print($postLink);
//exit;

$headers=array(
    "Content-Type: ".$contentType.";charset=UTF-8",
    "Authorization: Bearer ".$access_token,
    "Connection: close"
);

//print_r($entry[0]);
// xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">


substituteNode($entry[0], "cliente",$task["client"]);
substituteNode($entry[0], "proyecto",$task["project"]);
substituteNode($entry[0], "tarea",$task["task"]);
substituteNode($entry[0], "descripción",$task["description"]);
substituteNode($entry[0], "horas",$task["hours"]);
substituteNode($entry[0], "facturablesn",$task["facturable"]);
substituteNode($entry[0], "motivo",$task["motivo"]);
substituteNode($entry[0], "fecha",$task["date"]);

//print_r($entry[0]->asXML());
//exit;

/*
$xml=new SimpleXMLElement("<entry/>");
$xml->addAttribute("xmlns","http://www.w3.org/2005/Atom");
$xml->addAttribute("xmlns:xmlns:gsx","http://schemas.google.com/spreadsheets/2006/extended");

$xml->addChild("xmlns:gsx:id",$task["id"]);
$xml->addChild("xmlns:gsx:cliente",$task["client"]);
$xml->addChild("xmlns:gsx:proyecto",$task["project"]);
$xml->addChild("xmlns:gsx:tarea",$task["task"]);
$xml->addChild("xmlns:gsx:descripción",$task["description"]);

$xml->addChild("xmlns:gsx:horas",$task["hours"]);
$xml->addChild("xmlns:gsx:facturablesn",$task["facturable"]);
$xml->addChild("xmlns:gsx:motivo",$task["motivo"]);
$xml->addChild("xmlns:gsx:fecha",$task["date"]);
*/

//Header('Content-type: '.);
//print($xml->asXML());
//exit;

$entry[0]->addAttribute("xmlns","http://www.w3.org/2005/Atom");
$entry[0]->addAttribute("xmlns:xmlns:openSearch","http://a9.com/-/spec/opensearchrss/1.0/");
$entry[0]->addAttribute("xmlns:xmlns:gsx","http://schemas.google.com/spreadsheets/2006/extended");

//xmlns:openSearch=""
$xml=new SimpleXMLElement($entry[0]->asXML());
print_r($xml->asXML());

$access_token=$_REQUEST["access_token"];
$contentType=$_REQUEST["content-type"];
$worksheetId=$_REQUEST["worksheetId"]; //if post link does not work

$url = $postLink;


$ch2 = curl_init($url);
$headers=array(
        "Content-Type: ".$contentType.";charset=UTF-8",
        "Authorization: Bearer ".$access_token,
        "Content-Length: ".strlen($xml->asXML()."\r\n")//,
    //        "Connection: close"
        );

curl_setopt($ch2, CURLOPT_URL, $postLink);
curl_setopt($ch2, CURLOPT_PUT, 1);
//curl_setopt($ch2, CURLOPT_POST, 1);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $xml->asXML()."\r\n"); //before: $xml

curl_setopt($ch2, CURLOPT_HEADER, 1);
curl_setopt($ch2, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_VERBOSE, true);
//curl_setopt($ch2, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0 );

$response = curl_exec($ch2);

echo $response;
curl_close($ch2);


/*
 * data: { 'access_token' : GlobalConfiguration.getAccessToken().access_token,
                'tasks': JSON.stringify(task),
                'postLink' : this.postLink.href,
                'content-type' : this.postLink.type,
                'worksheetId' : worksheetId },*/

//FROM: https://developers.google.com/google-apps/spreadsheets/#adding_a_list_row

/*
 * Next, do any necessary authentication, and create an Authorization header for a new POST request as described in the authentication sections of this document.

In the body of the POST request, place the Atom entry element you created above, using the application/atom+xml content type.

Now, send the request to the POST URL:

<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">
  <gsx:cliente/>
  <gsx:proyecto/>
  <gsx:tarea/>
  <gsx:descripción/>
  <gsx:horas/>
  <gsx:facturablesn/>
  <gsx:motivo/>
  <gsx:fecha/>
</entry>*/

/* allHours.push({
                id: it.id.$t,
                date: day,
                client: it.gsx$cliente.$t,
                project: it.gsx$proyecto.$t,
                task: it.gsx$tarea.$t,
                description: it.gsx$descripción.$t,
                hours: GlobalConfiguration.parseFloat(it.gsx$horas.$t),
                facturable: it.gsx$facturablesn.$t,
                motivo: it.gsx$motivo.$t
            });*/