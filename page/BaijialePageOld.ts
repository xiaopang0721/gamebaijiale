/**
* 牛牛
*/
module gamebaijiale.page {
	const STATUS_CONFIG = ["准备中", "游戏开始", "发牌中", "下注中", "开牌中", "补牌中", "结算中", "显示结算", "准备中"];
	export class BaijialePageOld extends game.gui.base.Page {

		private _viewUI: ui.nqp.game_ui.baijiale.BaiJiaLe_HUDUI;
		private _player: any;
		private _playerInfo: any;
		private _listState: any;
		private _baijialeHudMgr: BaijialeHudMgr;
		private _gridEditorList: Array<GridEditor>;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._asset = [
				Path_game_baijiale.atlas_game_ui + "baijiale.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "logo.atlas",
			];
			this._isNeedDuang = false;
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.baijiale.BaiJiaLe_HUDUI', ["game_ui.tongyong.HudUI"]);
			this.addChild(this._viewUI);
			if (!this._baijialeHudMgr) {
				this._baijialeHudMgr = new BaijialeHudMgr(this._game);
				this._baijialeHudMgr.on(BaijialeHudMgr.EVENT_RETURN_MAPINFO, this, this.onUpdateMapinfo);
			}
			this._listState = [];
			this._gridEditorList = [];
			let textureTypes = {
				"X": Path_game_baijiale.ui_baijiale + "tu_x1.png",//闲
				"Z": Path_game_baijiale.ui_baijiale + "tu_g1.png",//庄
				"1": PathGameTongyong.ui_tongyong_general + "plszx_1.png",//和数量
				"2": PathGameTongyong.ui_tongyong_general + "plszx_2.png",
				"3": PathGameTongyong.ui_tongyong_general + "plszx_3.png",
				"4": PathGameTongyong.ui_tongyong_general + "plszx_4.png",
				"5": PathGameTongyong.ui_tongyong_general + "plszx_5.png",
				"6": PathGameTongyong.ui_tongyong_general + "plszx_6.png",
				"7": PathGameTongyong.ui_tongyong_general + "plszx_7.png",
				"8": PathGameTongyong.ui_tongyong_general + "plszx_8.png",
				"9": PathGameTongyong.ui_tongyong_general + "plszx_9.png",
			}
			for (let index = 0; index < this._viewUI.box_rooms.numChildren; index++) {
				this._viewUI.box_rooms._childs[index].visible = false;
				this._listState.push(this._viewUI["txt_status" + index]);
				this._gridEditorList.push(new GridEditor(19.1, 16.3, 30, 6, textureTypes, false))
				this._gridEditorList[index].x = 198;
				this._gridEditorList[index].y = 17;
				this._listState[index].parent.addChild(this._gridEditorList[index]);
			}
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.btn_xinshou.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.btn_chuji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.btn_zhongji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.btn_gaoji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			(this._viewUI.view as TongyongHudPage).onOpen(this._game, BaijialePageDef.GAME_NAME);
			for (let index = 0; index < this._viewUI.box_rooms.numChildren; index++) {
				this._viewUI.box_rooms._childs[index].visible = true;
				Laya.Tween.from(this._viewUI.box_rooms._childs[index], {
					right: -this._viewUI.box_rooms.width
				}, 200 + index * 100, Laya.Ease.linearNone);
			}

			this._game.playMusic(Path_game_baijiale.music_baijiale + "bjl_bgm.mp3");
		}

		//帧心跳
		update(diff: number) {
			if (this._baijialeHudMgr) {
				this._baijialeHudMgr.update(diff);
			}
			this.onTime();
		}

		private onUpdateMapinfo(): void {
			let data = this._baijialeHudMgr.data;
			for (let i = 0; i < this._gridEditorList.length; i++) {
				if (data[i][2]) {
					let roadInfo = data[i][2];
					let posInfo = data[i][3];
					let arr = [];
					if (roadInfo && roadInfo.length) {
						for (let j = 0; j < roadInfo.length; j++) {
							arr.push(posInfo[j][0]);
							arr.push(posInfo[j][1]);
							arr.push(roadInfo[j]);
						}
					}
					this._gridEditorList[i].setData(arr)
				}
			}
		}

		private onTime(): void {
			if (!this._baijialeHudMgr || !this._baijialeHudMgr.data || !this._baijialeHudMgr.data.length) return;
			let data = this._baijialeHudMgr.data;
			for (let i = 0; i < this._listState.length; i++) {
				let curTime = this._game.sync.serverTimeBys;
				let endTime = data[i][1] + 2;
				let time = Math.floor(endTime - curTime);
				if (time <= 0) {
					this._listState[i].text = "刷新中...";
				} else {
					this._listState[i].text = STATUS_CONFIG[data[i][0]] + time + "s";
				}
			}
		}


		protected onBtnTweenEnd(e: any, target: any): void {
			this._player = this._game.sceneObjectMgr.mainPlayer;
			if (!this._player) return;
			this._playerInfo = this._player.playerInfo;
			switch (target) {
				case this._viewUI.btn_xinshou:
					this._game.sceneObjectMgr.intoStory(BaijialePageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_BAIJIALE_1.toString(), true);
					break;
				case this._viewUI.btn_chuji:
					this._game.sceneObjectMgr.intoStory(BaijialePageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_BAIJIALE_2.toString(), true);
					break;
				case this._viewUI.btn_zhongji:
					this._game.sceneObjectMgr.intoStory(BaijialePageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_BAIJIALE_3.toString(), true);
					break;
				case this._viewUI.btn_gaoji:
					this._game.sceneObjectMgr.intoStory(BaijialePageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_BAIJIALE_4.toString(), true);
					break;
				default:
					break;
			}
		}

		private showTipsBox(limit: number) {
			TongyongPageDef.ins.alertRecharge(StringU.substitute("老板，您的金币少于{0}哦~\n补充点金币去大杀四方吧~", limit), () => {
				this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
			}, () => {
			}, false, PathGameTongyong.ui_tongyong_general + "btn_cz.png");
		}

		public close(): void {
			this._player = null;
			if (this._viewUI) {
				this._viewUI.btn_xinshou.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.btn_chuji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.btn_zhongji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.btn_gaoji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				if (this._baijialeHudMgr) {
					this._baijialeHudMgr.off(BaijialeHudMgr.EVENT_RETURN_MAPINFO, this, this.onUpdateMapinfo);
					this._baijialeHudMgr.clear();
					this._baijialeHudMgr = null;
				}
				this._game.stopMusic();
				Laya.Tween.clearAll(this);
				if (this._gridEditorList) {
					for (let i = 0; i < this._gridEditorList.length; i++) {
						this._gridEditorList[i].removeSelf()
						this._gridEditorList[i].destroy();
						this._gridEditorList[i] = null;
					}
				}
			}
			super.close();
		}
	}
}