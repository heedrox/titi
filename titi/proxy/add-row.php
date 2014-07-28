<?php
/**
 * Created by PhpStorm.
 * User: jmarti
 * Date: 1/06/14
 * Time: 22:59
 */

$task=json_decode($_REQUEST["tasks"], true); //true means get associative array instead of obj

$task["hours"]=str_replace(".",",",$task["hours"]); //3.5 debe ir como 3,5

$xml = new SimpleXMLElement('<entry/>');
$xml->addAttribute("xmlns","http://www.w3.org/2005/Atom");
$xml->addAttribute("xmlns:xmlns:gsx","http://schemas.google.com/spreadsheets/2006/extended");

$xml->addChild("xmlns:gsx:cliente",$task["client"]);
$xml->addChild("xmlns:gsx:proyecto",$task["project"]);
$xml->addChild("xmlns:gsx:tarea",$task["task"]);
$xml->addChild("xmlns:gsx:descripción",$task["description"]);
$xml->addChild("xmlns:gsx:horas",$task["hours"]);
$xml->addChild("xmlns:gsx:facturablesn",$task["facturable"]);
$xml->addChild("xmlns:gsx:motivo",$task["motivo"]);
$xml->addChild("xmlns:gsx:fecha",$task["date"]);

//Header('Content-type: '.);
print($xml->asXML());

$access_token=$_REQUEST["access_token"];
$postLink=$_REQUEST["postLink"];
$contentType=$_REQUEST["content-type"];
$worksheetId=$_REQUEST["worksheetId"]; //if post link does not work

if ($postLink=="") {
    die("no post link!");
}
$url = $postLink;
$ch = curl_init($url);

$headers=array(
        "Content-Type: ".$contentType.";charset=UTF-8",
        "Authorization: Bearer ".$access_token,
        "Connection: close"
        );
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $xml->asXML());

curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

echo $response;
curl_close($ch);


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