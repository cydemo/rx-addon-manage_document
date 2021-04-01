jQuery(document).ready(function($) {
	$(document).on('click', '#execute', function() {
		var document_count = $('.document_list').length;
		var params = {};

		if ( $('input[name="is_notice"]:checked').length > 0 ) {
			params.is_notice = $('input[name="is_notice"]:checked').val();
		}
		if ( $('input[name="status"]:checked').length > 0 ) {
			params.status = $('input[name="status"]:checked').val();
		}
		if ( $('input[name="notify_message"]:checked').length > 0 ) {
			params.notify_message = $('input[name="notify_message"]:checked').val();
		}
		if ( $('input[name="comment_status"]:checked').length > 0 ) {
			params.comment_status = $('input[name="comment_status"]:checked').val();
		}
		if ( $('input[name="title_bold"]:checked').length > 0 ) {
			params.title_bold = $('input[name="title_bold"]:checked').val();
		}
		if ( $('input[name="title_color"]').val().length > 0 ) {
			params.title_color = $('input[name="title_color"]').val();
		}
		if ( $('input[name="tags"]').val().length > 0 ) {
			params.tags = $('input[name="tags"]').val();
		}
		if ( $('input[name="is_tag"]:checked').length > 0 ) {
			params.is_tag = $('input[name="is_tag"]:checked').val();
		}
		if ( $('input[name="regdate"]').val().length > 0 ) {
			params.regdate = $('input[name="regdate"]').val().replace(/[^0-9]/g, '');
			if ( params.regdate.length === 12 ) {
				params.regdate += '00';
			}
			var regex = /[0-9]{4}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])(2[0-3]|[01][0-9])([0-5][0-9])([0-5][0-9])/;
			if ( !regex.test(params.regdate) ) {
				alert('등록일의 시간 형식에 오류가 있습니다.');
				$('input[name="regdate"]').val(params.regdate).focus();
				return false;
			}
		}
		if ( $('input[name="lang_code"]:checked').length > 0 ) {
			params.lang_code = $('input[name="lang_code"]:checked').val();
		}

		if ( $.isEmptyObject(params) )  {
			alert('문서 상태 변경 옵션을 하나 이상 선택해주세요.');
			return false;
		}
		if ( $('input[name="tags"]').val().length > 0 && (!params.is_tag || typeof params.is_tag === 'undefined') ) {
			alert('입력하신 태그(들)의 처리 방식을 선택해주세요.');
			$('input[name="is_tag"]').eq(0).focus();
			return false;
		}
		if ( $('input[name="tags"]').val().length <= 0 && (params.is_tag && typeof params.is_tag !== 'undefined') ) {
			alert('태그 항목을 변경하시려면 단어를 입력해주세요.');
			$('input[name="tags"]').focus();
			return false;
		}

		$('#overlay').show();
		setTimeout(function() {
			$('.document_list').find('input[name="cart"]').each(function(i) {
				params.document_srl = Number($(this).val());
				params.module_srl = Number($(this).data('module_srl'));
				params.old_tags = $(this).data('tags');
				$.ajax({
					url: './addons/manage_document/_status_changer.php',
					dataType: 'json',
					data: params,
					async: false,
					success: function() {
						if ( i + 1 === document_count )
						{
							alert('선택한 문서의 속성을 변경했습니다.');
							if ( opener ) opener.location.reload();
							window.close();
						}
					},
					error: function(x,e) {
						if ( x.status == 0 ) {
							alert('네트워크 연결 상태를 체크해주세요.');
						} else if ( x.status == 404 ) {
							alert('요청받은 URL을 찾을 수 없습니다.');
						} else if ( x.status == 500 ) {
							alert('내부 서버 오류');
						} else if ( e == 'parsererror' ) {
							alert('요청받은 내용을 변환하는 실패했습니다.');
						} else if ( e == 'timeout' ) {
							alert('연결 시간이 초과했습니다.');
						} else {
							alert('알 수 없는 에러가 발생했습니다.\n' + x.responseText);
						}
						$('#overlay').hide();
					}
				});
			});
		}, 0);
	});
});