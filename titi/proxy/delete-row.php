<?php
include "common/common.php"; //common GSAPI functions
/**
 * Created by PhpStorm.
 * User: jmarti
 * Date: 1/06/14
 * Time: 22:59
 */
$task=json_decode($_REQUEST["task"], true); //true means get associative array instead of obj
/********** FIRST, WE GET ALL THE TASKS OF ONE DAY ****************/

$url="https://spreadsheets.google.com/feeds/list/".$_REQUEST["keyFile"]."/".$_REQUEST["worksheetId"]."/private/full";
$entry=findEntryByID($_REQUEST["postLink"],$task["date"], $_REQUEST["access_token"],$task["id"]);

$tmpentry=new SimpleXMLElement($entry->asXML());
$postlinkentry=$tmpentry->xpath("link[@rel='edit']/@href");

$postLink=$postlinkentry[0];

print $postLink;

if ($postLink=="") {
    die("no post link!");
}

$access_token=$_REQUEST["access_token"];
$contentType=$_REQUEST["content-type"];
$worksheetId=$_REQUEST["worksheetId"]; //if post link does not work

$url = $postLink;

$ch2 = curl_init($url);
$headers=array(
    "Content-Type: ".$contentType.";charset=UTF-8",
    "Authorization: Bearer ".$access_token,
    "Connection: close"
);

curl_setopt($ch2, CURLOPT_URL, $postLink);
//curl_setopt($ch2, CURLOPT_PUT, 1);
curl_setopt($ch2, CURLOPT_CUSTOMREQUEST, "DELETE");
//curl_setopt($ch2, CURLOPT_POST, 1);
//curl_setopt($ch2, CURLOPT_POSTFIELDS, $xml->asXML()); //before: $xml

curl_setopt($ch2, CURLOPT_HEADER, 1);
curl_setopt($ch2, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_VERBOSE, true);
$httpcode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
//curl_setopt($ch2, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0 );

$response = curl_exec($ch2);

//echo $response;
curl_close($ch2);

if ($response!=200) {
    die($response." - ERROR! - ".$response);
} else {
    print("OK!");
}
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