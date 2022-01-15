<?php
/**
 * Microsoft's Monaco Editor for WonderCMS! :)
 *
 * @author mjxl
 * @version 3.0.4
 */

global $Wcms;

if (defined('VERSION')) {
  define('version', VERSION);
  defined('version') or die('Direct access is not allowed.');
}

$Wcms->addListener('js', 'monacoJS');
$Wcms->addListener('css', 'monacoCSS');

function monacoJS($args)
{
  global $Wcms;
  if ($Wcms->loggedIn) {
    $script = <<<EOT
    <script src='https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/min/vs/loader.js'></script>
    <script src='{$Wcms->url('plugins/monaco-editor/js/wcms-monaco.js')}'></script>
EOT;
    $args[0] .= $script;
  }
  return $args;
}

function monacoCSS($args)
{
  global $Wcms;
  if ($Wcms->loggedIn) {
    $script = <<<EOT
    <link href="https://fonts.googleapis.com/css?family=Fira+Code" rel="stylesheet" />
    <link rel='stylesheet' href='{$Wcms->url('plugins/monaco-editor/css/wcms-monaco.css')}' media='screen'>
EOT;
    $args[0] .= $script;
  }
  return $args;
}
