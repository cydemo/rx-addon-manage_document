<?php
if ( !defined('RX_VERSION') ) return;

/*******************/
/* 게시물 관리자 팝업창 로드 */
/*******************/

if ( $called_position !== 'after_module_proc' ) return;
if ( $this->module !== 'document' || $this->act !== 'dispDocumentManageDocument' || !$this->grant->manager ) return;

// 언어팩 로드
Context::loadLang(__DIR__ . '/lang');

$command_list = array(
	'manage_document' => lang('cmd_manage_document'),
	'author_changer' => lang('author') .  ' ' . lang('cmd_replace'),
	'status_changer' => lang('document_property') .  ' ' . lang('cmd_replace'),
);
Context::set('command_list', $command_list);

$manage_type = Context::get('manage_type');
if ( $manage_type === 'status_changer' )
{
	$is_notice = array(
		'Y' => lang('notice'),
		'N' => lang('not_notice'),
	);
	Context::set('is_notice', $is_notice);

	$is_notify_message = array(
		'N' => lang('no_notify'),
		'Y' => lang('notify'),
	);
	Context::set('is_notify_message', $is_notify_message);

	$is_comment = array(
		'ALLOW' => lang('allow_comment'),
		'DENY' => lang('lock_comment'),
	);
	Context::set('is_comment', $is_comment);

	$is_tag = array(
		'ADD' => lang('cmd_add'),
		'REPLACE' => lang('cmd_replace'),
	);
	Context::set('is_tag', $is_tag);

	$is_bold = array(
		'Y' => lang('title_bold'),
		'N' => lang('title_normal'),
	);
	Context::set('is_bold', $is_bold);

	$lang_supported = Context::loadLangSupported();
	$lang_selected = Context::loadLangSelected();
	$lang_list = array_intersect_key($lang_supported, $lang_selected);
	Context::set('lang_list', $lang_list);
}
else if ( $manage_type === 'author_changer' )
{
	// 회원 신원 확인 방식
	$config = MemberModel::getMemberConfig();
	$memberIdentifiers = array(
		'user_id' => 'user_id',
		'email_address' => 'email_address',
		'phone_number' => 'phone_number',
		'user_name' => 'user_name',
		'nick_name' => 'nick_name'
	);
	$usedIdentifiers = array();
	if ( is_array($config->signupForm) )
	{
		foreach ( $config->signupForm as $signupItem )
		{
			if ( !count($memberIdentifiers) ) break;
			if ( in_array($signupItem->name, $memberIdentifiers) && ($signupItem->required || $signupItem->isUse) )
			{
				unset($memberIdentifiers[$signupItem->name]);
				$usedIdentifiers[$signupItem->name] = Context::getLang($signupItem->name);
			}
		}
	}

	// 검색 대상 설정
	$search_target_list = array_merge($usedIdentifiers, lang('member.search_target_list')->getArrayCopy());
	Context::set('search_target_list', $search_target_list);

	// 회원 그룹
	Context::set('group_list', MemberModel::getGroups(0));

	// 회원 목록
	if ( Context::get('selected_group_srl') !== null )
	{
		$output = getAdminModel('member')->getMemberList();
		if ( $output->data )
		{
			Context::set('total_count', $output->total_count);
			Context::set('total_page', $output->total_page);
			Context::set('page', $output->page);
			Context::set('member_list', $output->data);
			Context::set('page_navigation', $output->page_navigation);
		}
	}
}
else
{
	$board_list = array();
	$module_categories = ModuleModel::getModuleCategories();
	if ( $addon_info->excluded_target_mids )
	{
		$excluded_target_mids = array_map('trim', explode("\r\n", $addon_info->excluded_target_mids));
	}

	$args = new stdClass;
	$args->module = 'board';

	if ( !empty($module_categories) )
	{
		foreach ( $module_categories as $srl => $val )
		{
			$args->module_category_srl = $srl;
			$output = ModuleModel::getMidList($args);
			if ( empty($output) )
			{
				continue;
			}
			if ( !empty($excluded_target_mids) )
			{
				foreach ( $excluded_target_mids as $v )
				{
					if ( isset($output[$v]) )
					{
						unset($output[$v]);
					}
				}
			}
			$board_list[$srl] = new stdClass;
			$board_list[$srl]->module_category_srl = $srl;
			$board_list[$srl]->title = $val->title;
			$board_list[$srl]->list = $output;
		}
	}

	$args->module_category_srl = 0;
	$output = ModuleModel::getMidList($args);
	if ( !empty($output) )
	{
		if ( !empty($excluded_target_mids) )
		{
			foreach ( $excluded_target_mids as $v )
			{
				if ( isset($output[$v]) )
				{
					unset($output[$v]);
				}
			}
		}
		$board_list[0] = new stdClass;
		$board_list[0]->module_category_srl = 0;
		$board_list[0]->title = lang('none_category');
		$board_list[0]->list = $output;
	}

	if ( $addon_info->use_filter === 'Y' )
	{
		Context::set('use_filter', $addon_info->use_filter);
	}
	Context::set('board_list', $board_list);
	Context::set('module_categories', $module_categories);
}

// 애드온 스킨 파일을 컴파일
$this->setTemplatePath(__DIR__ . '/tpl');
$this->setTemplateFile('default');