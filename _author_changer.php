<?php

define('__XE__', true);
require_once '../../config/config.inc.php';
$oContext = &Context::getInstance();
$oContext->init();

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
$args->document_srl = $document_srl = (int)$_REQUEST['document_srl'];
$args->member_srl = $member_srl = (int)$_REQUEST['member_srl'];

$use_anonymous = ($_REQUEST['use_anonymous'] === 'true') ? true: false;
if ( $use_anonymous )
{
	$module_info = ModuleModel::getModuleInfoByModuleSrl($module_srl);
	$anonymous_name = $module_info->anonymous_name ?: 'anonymous';
	$anonymous_name = getController('board')->createAnonymousName($anonymous_name, $member_srl, $document_srl);
	
	$args->notify_message = 'N';
	$args->email_address = $args->homepage = $args->user_id = '';
	$args->user_name = $args->nick_name = $anonymous_name;
	$args->member_srl = abs($member_srl) * -1;
}
else
{
	$args->nick_name = $_REQUEST['nick_name'];
	$args->user_id = $_REQUEST['user_id'];
	$args->user_name = $_REQUEST['user_name'];
	$args->email_address = $_REQUEST['email_address'];
	$args->homepage = $_REQUEST['homepage'];
}

$author_changer = executeQuery('addons.manage_document.updateDocumentInfo', $args);

unset($_SESSION['document_management'][$document_srl]);
getController('document')->clearDocumentCache($document_srl);

$apply_point = ($_REQUEST['apply_point'] === 'true') ? true: false;
$original_member_srl = abs((int)$_REQUEST['original_member_srl']);
if ( $apply_point && $original_member_srl )
{
	$status = $_REQUEST['status'];
	$uploaded_count = (int)$_REQUEST['uploaded_count'];

	$config = ModuleModel::getModuleConfig('point');
	$module_config = ModuleModel::getModulePartConfig('point', $module_srl);
	$is_temp = DocumentModel::getConfigStatus('temp');
	$oPointController = getController('point');

	// Give points for deleting a file
	if ( $config->upload_file_revert_on_delete !== false && $uploaded_count > 0 )
	{
		if ( isset($module_config['upload_file']) && $module_config['upload_file'] !== '' )
		{
			$point = $module_config['upload_file'];
		}
		else
		{
			$point = $config->upload_file;
		}
		$diff = intval($point);
		if ( $diff !== 0 )
		{
			$diff = $diff * $uploaded_count;
			$cur_point = PointModel::getPoint($original_member_srl);
			$oPointController->setPoint($original_member_srl, $cur_point - $diff);
		}
	}

	// Gives points for deleting a document
	if ( $config->insert_document_revert_on_delete !== false && $status !== $is_temp )
	{
		if ( isset($module_config['insert_document']) && $module_config['insert_document'] !== '' )
		{
			$point = $module_config['insert_document'];
		}
		else
		{
			$point = $config->insert_document;
		}
		$diff = intval($point);
		if ( $diff !== 0 )
		{
			$cur_point = PointModel::getPoint($original_member_srl);
			$oPointController->setPoint($original_member_srl, $cur_point - $diff);
		}
	}

	// Gives points for inserting a document
	if ( $status !== $is_temp )
	{
		$diff = 0;
		if ( isset($module_config['insert_document']) && $module_config['insert_document'] !== '' )
		{
			$point = $module_config['insert_document'];
		}
		else
		{
			$point = $config->insert_document;
		}
		$diff += intval($point);
		if ( $uploaded_count > 0 )
		{
			if ( isset($module_config['upload_file']) && $module_config['upload_file'] !== '' )
			{
				$upload_point = $module_config['upload_file'];
			}
			else
			{
				$upload_point = $config->upload_file;
			}
			$diff += intval($upload_point) * $uploaded_count;
		}
		if ( $diff !== 0 )
		{
			$cur_point = PointModel::getPoint($member_srl);
			$oPointController->setPoint($member_srl, $cur_point + $diff);
		}
	}
}

$oContext->close();

?>