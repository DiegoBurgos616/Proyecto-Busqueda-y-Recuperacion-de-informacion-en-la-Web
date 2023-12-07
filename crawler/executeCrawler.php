<?php
include("./crawlerScripts/LIB_http.php");
include("./crawlerScripts/LIB_parse.php");
include("./crawlerScripts/LIB_resolve_addresses.php");
include("./crawlerScripts/LIB_http_codes.php");
require_once 'vendor/autoload.php';
use ICanBoogie\Inflector;

function getHTML($page){
    # Define the target and referrer web pages
    $SourceCode = http_get($page, "");
    return $SourceCode;
}
function getLinks($html, $page_base){
    $_links = array();
    $link_array = parse_array($html['FILE'], $beg_tag="<a", $close_tag=">" );
    for($xx=0; $xx<count($link_array); $xx++){
        $link = get_attribute($tag=$link_array[$xx], $attribute="href");
        // Create a fully resolved address
        $resloved_link_address = resolve_address($link, $page_base);
        $downloaded_link = http_get($resloved_link_address, $page_base);
        // echo $downloaded_link['STATUS']['url'];
        // 404 
        if($downloaded_link['STATUS']['http_code'] == 200 && ($downloaded_link != $page_base)){

            echo($downloaded_link['STATUS']['http_code']."<br>");
            echo($page_base."<br>");
            
            array_push($_links,$downloaded_link['STATUS']['url'] );
        }
    }
    $_links = array_unique($_links);
    // echo('<pre>');
    // print_r($_links);
    // echo('</pre>');
    return $_links;
}
function detectLanguage($page){
    // ************************************************
    // ************************************************
    // Detector de idioma
    $detector = new LanguageDetector\LanguageDetector();
    $language = $detector->evaluate($page)->getLanguage();
    return $language; // Prints something like 'en'
}
function Singular($page, $lang){
    $language = strval($lang);
    if( $lang != "en" && $lang != "es" ){
        return $page;
    }
    $words = explode(" ",$page);
    // ************************************************
    // ************************************************
    // Singularización 
    // Aplicar singularización a los tokens 
    $inflector = Inflector::get();
    $page = "";
    foreach ($words as $key => $word) {
        $wordSingular= $inflector->singularize($word,$language);
        $page = $page." ".$wordSingular;
    }
    return $page;
}
function quitar_tildes($cadena) {
    $no_permitidas= array ("á","é","í","ó","ú","Á","É","Í","Ó","Ú","ñ","À","Ã","Ì","Ò","Ù","Ã™","Ã ","Ã¨","Ã¬","Ã²","Ã¹","ç","Ç","Ã¢","ê","Ã®","Ã´","Ã»","Ã‚","ÃŠ","ÃŽ","Ã”","Ã›","ü","Ã¶","Ã–","Ã¯","Ã¤","«","Ò","Ã","Ã„","Ã‹");
    $permitidas= array ("a","e","i","o","u","A","E","I","O","U","n","N","A","E","I","O","U","a","e","i","o","u","c","C","a","e","i","o","u","A","E","I","O","U","u","o","O","i","a","e","U","I","A","E");
    $texto = str_replace($no_permitidas, $permitidas ,$cadena);
    return $texto;
}
function rip_tags($string) {
    // ----- remove HTML script ans style -----
    $string =preg_replace('/(<(script|style)\b[^>]*>).*?(<\/\2>)/is', "", $string);
    // ----- remove HTML TAGs -----
    $string = preg_replace ('/<[^>]*>/', ' ', $string);
    // ----- remove control characters -----
    $string = str_replace("\r", '', $string);    // --- replace with empty space
    $string = str_replace("\n", ' ', $string);   // --- replace with space
    $string = str_replace("\t", ' ', $string);   // --- replace with space
    $string = quitar_tildes($string);
    $string = preg_replace("/[^a-zA-Z0-9\s]+/", "", $string);
    // ----- remove multiple spaces -----
    $string = trim(preg_replace('/ {2,}/', ' ', $string));
    return $string;
}
function remove_stop_word($language,$str){
    //Read File and get stopWords to delete
    switch ($language) {
        case 'en':
            $PATH = 'stopWords\stop-words_english_4_google_en.txt';
            break;
        case 'es':
            $PATH = 'stopWords\stop-words_spanish_1_es.txt';
            break;
        default:
            $PATH = null;
            break;
    }
    if($PATH == NULL){
        return $str;
    }
    $stopwords = file_get_contents($PATH);
    $stopwords = str_replace("\r", '', $stopwords);
    $stopwords = str_replace("\n", ' ', $stopwords);
    $stopwords = explode(' ',$stopwords);
    $str= explode(' ',$str);
    foreach ($str as $key => $word) {
        if (in_array($word, $stopwords)) $str[$key] = '';
    }   
    $str = implode(' ',$str);
    return $str = trim(preg_replace('/ {2,}/', ' ', $str));
}
function savePageDB($body, $title, $url){

    
    $data = array(array("body_es" => $body, "snippet" => substr($body, 0, 100), "titulo_es" => $title, "link" => $url));                                                                    
    $data_string = json_encode($data);       
    // print_r($data_string);                                                                            
    $ch = curl_init('http://localhost:8983/solr/briwtest/update?commitWithin=1000&overwrite=true&wt=json');                                                                      
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
        'Content-Type: application/json',                                                                                
        'Content-Length: ' . strlen($data_string))                                                                       
    );                                                                                                                   
    $result = curl_exec($ch);
}
function visitLevel1($links){
    foreach ($links as $key => $link) {
        $htmlPage = getHTML($link);
        // $links = getLinks($htmlPage, $page);
        // $stripPage = filterHTML($htmlPage);
        $stripPage = rip_tags(mb_strtolower($htmlPage['FILE']));
        $title_excl = rip_tags(return_between($htmlPage['FILE'], "<title>", "</title>",EXCL));
        $language = detectLanguage($stripPage);
        // $filterHTML = remove_stop_word($language, $stripPage);

        // Singular
        //$wordsSingular = Singular($stripPage, $language);
        // Guardar página 
        // $wordsSingular
        //echo($title_excl);
        savePageDB($stripPage, $title_excl, $link);
  
    }
}
function visitLevel0($pages){
    foreach ($pages as $key => $page) {
        $htmlPage = getHTML($page);
        $links = array_unique(getLinks($htmlPage, $page));
        // $stripPage = filterHTML($htmlPage);
        $stripPage = rip_tags(mb_strtolower($htmlPage['FILE']));
        $language = detectLanguage($stripPage);
        // $filterHTML = remove_stop_word($language, $stripPage);
        // Singular
        //$wordsSingular = Singular($stripPage, $language);
        $title_excl = rip_tags(return_between($htmlPage['FILE'], "<title>", "</title>",EXCL));
        // Guardar página 
        // $wordsSingular
        echo($title_excl);
        savePageDB($stripPage, $title_excl, $page);
        visitLevel1($links);
    
    }
}
// Se obtienen las páginas del formulario
$file = file_get_contents("links.txt");
$pages = explode("\n", $file);

// se obtiene el código HTML
visitLevel0($pages);
echo("Tarea terminada...");
?>
