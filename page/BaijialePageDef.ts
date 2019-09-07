/**
* name 
*/
module gamebaijiale.page {
	export class BaijialePageDef extends game.gui.page.PageDef {
		static GAME_NAME: string;
		//百家乐界面
		static PAGE_BAIJIALE: string = "1";
		//百家乐地图UI
		static PAGE_BAIJIALE_MAP: string = "2";
		//百家乐开始下注界面
		static PAGE_BAIJIALE_BEGIN: string = "3";
		//百家乐游戏规则界面
		static PAGE_BAIJIALE_RULE: string = "101";
		//百家乐游戏VS界面
		static PAGE_BAIJIALE_VS: string = "6";
		//百家乐玩家列表界面
		static PAGE_BAIJIALE_PLAYER_LIST: string = "10";
		//百家乐停止下注界面
		static PAGE_BAIJIALE_END: string = "11";
		//百家乐大路界面
		static PAGE_BAIJIALE_ROAD: string = "13";
		//百家乐结果界面
		static PAGE_BAIJIALE_RESULT: string = "14";

		static myinit(str: string) {
			super.myinit(str);
			BaijialeClip.init();
			if (WebConfig.baseplatform == PageDef.BASE_PLATFORM_TYPE_NQP) {
				PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE] = BaijialePage;
			} else {
				PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE] = BaijialePageOld;
			}
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_MAP] = BaijialeMapPage;
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_BEGIN] = BaijialeBeginPage;
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_RULE] = BaijialeRulePage;
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_PLAYER_LIST] = BaijialePlayerListPage;
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_END] = BaijialeEndPage;
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_ROAD] = BaijialeRoadPage;
			PageDef._pageClassMap[BaijialePageDef.PAGE_BAIJIALE_RESULT] = BaijialeResultPage;

			this["__needLoadAsset"] = [
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "logo.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				Path_game_baijiale.atlas_game_ui + "baijiale.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "tuichu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "qifu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/suiji.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/kaipai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/bigwin.atlas",
				Path_game_baijiale.ui_baijiale + "zjh.jpg",
				Path.custom_atlas_scene + 'card.atlas',
				Path.custom_atlas_scene + 'chip.atlas',

				PathGameTongyong.ui_tongyong_sk + "HeGuan.sk",
				PathGameTongyong.ui_tongyong_sk + "HeGuan.png",

				Path.map + 'pz_baijiale.png',
				Path.map_far + 'bg_baijiale.jpg'
			]

			if (WebConfig.needMusicPreload) {
				this["__needLoadAsset"] = this["__needLoadAsset"].concat([
					Path_game_baijiale.music_baijiale + "bjl_bgm.mp3",
					Path_game_baijiale.music_baijiale + "bupai.mp3",
					Path_game_baijiale.music_baijiale + "chouma.mp3",
					Path_game_baijiale.music_baijiale + "dian0.mp3",
					Path_game_baijiale.music_baijiale + "dian1.mp3",
					Path_game_baijiale.music_baijiale + "dian2.mp3",
					Path_game_baijiale.music_baijiale + "dian3.mp3",
					Path_game_baijiale.music_baijiale + "dian4.mp3",
					Path_game_baijiale.music_baijiale + "dian5.mp3",
					Path_game_baijiale.music_baijiale + "dian6.mp3",
					Path_game_baijiale.music_baijiale + "dian7.mp3",
					Path_game_baijiale.music_baijiale + "dian8.mp3",
					Path_game_baijiale.music_baijiale + "dian9.mp3",
					Path_game_baijiale.music_baijiale + "dingding_end.mp3",
					Path_game_baijiale.music_baijiale + "dingding_start.mp3",
					Path_game_baijiale.music_baijiale + "dui_xian.mp3",
					Path_game_baijiale.music_baijiale + "dui_zhuang.mp3",
					Path_game_baijiale.music_baijiale + "he.mp3",
					Path_game_baijiale.music_baijiale + "piaoqian.mp3",
					Path_game_baijiale.music_baijiale + "shouqian.mp3",
					Path_game_baijiale.music_baijiale + "win_xian.mp3",
					Path_game_baijiale.music_baijiale + "win_zhuang.mp3",
					Path_game_baijiale.music_baijiale + "xian.mp3",
					Path_game_baijiale.music_baijiale + "xiazhu_end.mp3",
					Path_game_baijiale.music_baijiale + "xiazhu_start.mp3",
					Path_game_baijiale.music_baijiale + "zhuang.mp3",
				])
			}
		}
	}
}