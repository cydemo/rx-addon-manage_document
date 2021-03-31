jQuery(document).ready(function($) {

	// 검색 대상 요소와 검색 필드 요소 정의
	var menu_text = $('.board_filter[type=search]');
	var list = $('.target_list');
	var target_wrapper = '.target_list > li';
	var target = '.target_items > li';
	var no_result = 'no_result';

	// '검색 결과 없음' 표시 부분을 hidden 상태로 삽입
	if ( xe.current_lang === 'ko' ) {
		var msg = '검색 결과가 없습니다.';
	} else {
		var msg = 'No results found.';
	}
	$('<div class="'+ no_result +'" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 16px; color: #666;">'+ msg +'</div>').appendTo(list.eq(0));
	
	var data = [];
	$(target).each(function(i, v) {
		data[i] = {};
		data[i].text = $(this).children('a').text();
	});

	menu_text.each(function(i) {
		// 필터링 적용시 검색창에 내용이 없으면 메뉴 리스트 전체를 다시 display
		menu_text.eq(i).attr('autocomplete', 'off').on('input', function() {
			if ( !$(this).val() ) {
				$('.'+no_result).hide();
				$(target).show();
				$(target_wrapper).show();
			} else {
				procFiltering($(this).val(), data);
			}
		});
	});

	// 검색어를 자모음 단위로 재배열하고 필터링 실행하는 함수
	function procFiltering(val, data) {
		var text_list = getTextList(val, data);

		// 검색어에 따라 요소 감춤 및 보이기
		$(target).each(function() {
			if ( $.inArray($(this).children('a').text(), text_list) === -1 ) {
				$(this).hide();
			} else {
				$('.'+no_result).hide();
				$(this).show();
				$(this).parent().parent().show();
			}
		});

		// 메뉴 리스트와 연관된 상위 요소 출력 제어
		$(target_wrapper).each(function() {
			if ( $(this).find(target + ':visible').length === 0 ) {
				$(this).hide();
			} else {
				$(this).show();
			}
		});
		if ( $(target_wrapper + ':visible').length === 0 ) {
			$('.'+no_result).fadeIn();
		}
	}

	// 자모음 분리 기반 검색어 유사도 우선 결과값 리턴 - 메뉴 제목
	function getTextList(str, data) {
		var arr = [];
		$.each(data, function(i, val) {
			arr[i] = val.text;
		});

		var str_disassembled = Hangul.disassemble(str).join(''),
			startsWithMatcher = new RegExp('^' + str_disassembled, 'i'),
			containsMatcher = new RegExp(str_disassembled, 'i');
			
		var startsWith = $.grep(arr, function(val) {
				val = Hangul.disassemble(val).join('');
				return $('<div />').html(val.toLowerCase()).text().indexOf(str_disassembled.toLowerCase()) > -1 &&
					startsWithMatcher.test(val.label || val.text || val);
			}),
			contains = $.grep(arr, function (val) {
				val = Hangul.disassemble(val).join('');
				return $('<div />').html(val.toLowerCase()).text().indexOf(str_disassembled.toLowerCase()) > -1 &&
					!startsWithMatcher.test(val.label || val.text || val) &&
					containsMatcher.test(val.label || val.text || val);
			});
		
		return startsWith.sort().concat(contains.sort());
	}
});