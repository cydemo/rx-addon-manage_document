<?php

include '../../common/autoload.php';
Context::init();

$module_srl = (int)$_REQUEST['module_srl'];
$logged_info = Context::get('logged_info');
if ( $logged_info->is_admin !== 'Y' )
{
	$module_info = ModuleModel::getModuleInfoByModuleSrl($module_srl);
	$grant = ModuleModel::getGrant($module_info, $logged_info);
	if ( !$grant->manager )
	{
		return new baseObject(-1, 'msg_not_permitted');
	}
}

$args = new stdClass;
$args->module_srl = $module_srl;
$args->document_srl = $document_srl = (int)$_REQUEST['document_srl'];
$args->lang_code = Context::getLangType();

$extra_keys = DocumentModel::getExtraKeys($module_srl);
$del_prev = $_REQUEST['del_prev'];
if ( count($extra_keys) )
{
	foreach ( $extra_keys as $idx => $extra_item )
	{
		if ( isset($_REQUEST['extra_vars'.$idx]) )
		{
			$args->var_idx = $idx;
			$args->value = trim($_REQUEST['extra_vars'.$idx]);
			$args->eid = $extra_item->eid;
			$extra_vars_changer = executeQuery('document.insertDocumentExtraVar', $args);
		}
		else
		{
			if ( $del_prev === 'Y' )
			{
				$args->var_idx = $idx;
				$args->eid = $extra_item->eid;
				$extra_vars_changer = executeQuery('document.deleteDocumentExtraVars', $args);
			}
			else
			{
				continue;
			}
		}
	}
}

unset($_SESSION['document_management'][$document_srl]);
getController('document')->clearDocumentCache($document_srl);

?>