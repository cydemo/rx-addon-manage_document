<?php

require_once '../../config/config.inc.php';
$oContext = &Context::getInstance();
$oContext->init();

$module_srl = (int)$_REQUEST['module_srl'];
$logged_info = Context::get('logged_info');
$grant = ModuleModel::getGrant($module_srl, $logged_info);

if ( !$grant->manager )
{
	return new baseObject(-1, 'msg_not_permitted');
}


$args = new stdClass;
$args->document_srl = $document_srl = (int)$_REQUEST['document_srl'];

$args->is_notice = $_REQUEST['is_notice'] ?? null;
$args->status = $_REQUEST['status'] ?? null;
$args->notify_message = $_REQUEST['notify_message'] ?? null;
$args->comment_status = $_REQUEST['comment_status'] ?? null;

$tags = $_REQUEST['tags'] ?? null;
if ( $tags )
{
	$tag_list = array_map(function($str) { return escape(utf8_trim($str), false); }, explode(',', $tags));
	$tag_list = array_filter($tag_list, function($str) { return $str !== ''; });
	$_tag_list = array_unique($tag_list);
	$tags = implode(',', $_tag_list);
}
$is_tag = $_REQUEST['is_tag'] ?? null;
$old_tags = $_REQUEST['old_tags'] ? str_replace('|@|', ',', $_REQUEST['old_tags']) : '';
if ( $tags !== null && $is_tag !== null )
{
	$new_tags = '';
	if ( $is_tag === 'ADD' )
	{
		$new_tags = $old_tags . ',' . $tags;
	}
	else if ( $is_tag === 'REPLACE' )
	{
		$new_tags = $tags;
	}
	$args->tags = $new_tags;
}
else
{
	$args->tags = null;
}

$args->regdate = $_REQUEST['regdate'] ?? null;

$args->title_bold = $_REQUEST['title_bold'] ?? null;
$args->title_color = $_REQUEST['title_color'] ?? null;
if ( $args->title_color === 'transparent' )
{
	$args->title_color = 'N';
}

$args->lang_code = $_REQUEST['lang_code'] ?? null;

$status_changer = executeQuery('addons.manage_document.updateDocumentInfo', $args);

unset($_SESSION['document_management'][$document_srl]);
getController('document')->clearDocumentCache($document_srl);

$oContext->close();

?>