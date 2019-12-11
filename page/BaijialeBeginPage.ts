/**
* name 
*/
module gamebaijiale.page{
	export class BaijialeBeginPage extends game.gui.base.Page {
		private _viewUI: ui.ajqp.game_ui.baijiale.GoUI;
		
		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._asset = [
				PathGameTongyong.atlas_game_ui_tongyong+ "general.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.baijiale.GoUI');
			this.addChild(this._viewUI);
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.ani1.on(LEvent.COMPLETE, this, this.onPlayComplte);
			this._viewUI.ani1.play(0, false);
		}
	
        private onPlayComplte(): void {
            this.close();
        }

		public close(): void {
			if (this._viewUI) {
				this._viewUI.ani1.off(LEvent.COMPLETE, this, this.onPlayComplte);
			}
			super.close();
		}
	}
}