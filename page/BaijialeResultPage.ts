/**
* name 
*/
module gamebaijiale.page {
	export class BaijialeResultPage extends game.gui.base.Page {
		private _viewUI: ui.game_ui.baijiale.YingUI;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._asset = [
				Path_game_baijiale.atlas_game_ui + "baijiale.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/bigwin.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.baijiale.YingUI');
			this.addChild(this._viewUI);
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.img_result.skin = StringU.substitute(Path_game_baijiale.ui_baijiale + "winTxt{0}.png", this.dataSource);
			this._viewUI.ani1.on(LEvent.COMPLETE, this, this.onPlayComplte);
			this._viewUI.ani1.play(0, false);
		}

		private onPlayComplte(): void {
			this.close();
		}

		public close(): void {
			if (this._viewUI) {
				if (this._viewUI.ani1) {
					this._viewUI.ani1.off(LEvent.COMPLETE, this, this.onPlayComplte);
				}
			}
			super.close();
		}
	}
}