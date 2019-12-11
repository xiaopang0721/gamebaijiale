/**
* name 
*/
module gamebaijiale.page {
	const TYPE_WANFA_JIESHAO: number = 0;
	const TYPE_CARD_BEISHU: number = 1;
	export class BaijialeRulePage extends game.gui.base.Page {

		private _viewUI: ui.ajqp.game_ui.baijiale.BaiJiaLe_GuiZeUI;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._isNeedBlack = true;
			this._isClickBlack = true;
			this._asset = [
				Path_game_baijiale.atlas_game_ui + "baijiale.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.baijiale.BaiJiaLe_GuiZeUI');
			this.addChild(this._viewUI);

		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.txt_beishu.vScrollBarSkin = "";
			this._viewUI.txt_beishu.vScrollBar.autoHide = true;
			this._viewUI.txt_beishu.vScrollBar.elasticDistance = 100;
			//更新滚动条最大滚动数值
			// this._viewUI.panel_wanfa.vScrollBar.max = 820;
			this._viewUI.btn_tab.selectHandler = Handler.create(this, this.selectHandler, null, false);
			if (this.dataSource) {
				this._viewUI.btn_tab.selectedIndex = this.dataSource;
			} else {
				this._viewUI.btn_tab.selectedIndex = TYPE_WANFA_JIESHAO;
			}
		}

		private selectHandler(index: number): void {
			this._viewUI.txt_wanfa.visible = this._viewUI.btn_tab.selectedIndex == TYPE_WANFA_JIESHAO;
			this._viewUI.txt_beishu.visible = this._viewUI.btn_tab.selectedIndex == TYPE_CARD_BEISHU;
		}

		public close(): void {
			if (this._viewUI) {
				this._viewUI.btn_tab.selectedIndex = -1;
			}
			super.close();
		}
	}
}