jQuery(document).ready(function($) {
	var fields = $('.target_list#extra_keys [name^=extra_vars]');
	fields.each(function() {
		if ( $(this).prop('tagName') === 'SELECT' ) {
			$('<option value="">선택 없음</option>').prependTo($(this));
			$(this).val('').trigger('change');
		}
	});

	$(document).on('click', '#execute', function() {
		var document_count = $('.document_list').length;
		var params = {}, name = '', value = '';
		var values = fields.serializeArray();
		var del_prev_value = $('input#del_prev_value').is(':checked');
		$.each(values, function(i, v) {
			name = v.name.replace('[]', '');
			if ( v.value ) {
				if ( params[name] ) {
					params[name] += '|@|' + v.value;
				} else {
					params[name] = v.value;
				}
			} else {
				return true;
			}
		});

		if ( $.isEmptyObject(params) )  {
			if ( del_prev_value ) {
				var confirm_del_prev_value = confirm('확장변수값을 모두 삭제해도 좋습니까?');
				if ( !confirm_del_prev_value ) {
					return false;
				}
			} else {
				alert('확장 변수 변경 옵션을 하나 이상 선택해주세요.');
				return false;
			}
		}
		params.del_prev = del_prev_value ? 'Y' : 'N';

		setTimeout(function() {
			$('.document_list').find('input[name="cart"]').each(function(i) {
				params.document_srl = Number($(this).val());
				params.module_srl = Number($(this).data('module_srl'));
				$.ajax({
					url: './addons/manage_document/_extra_vars_changer.php',
					dataType: 'json',
					data: params,
					async: false,
					success: function(data) {
						if ( i + 1 === document_count )
						{
							alert('선택한 문서의 확장변수값 변경이 완료됐습니다!');
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