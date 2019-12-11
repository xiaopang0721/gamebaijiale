/**
* name 
*/
module gamebaijiale.page {
	export class BaijialeRoadPage extends game.gui.base.Page {
		private _viewUI: ui.ajqp.game_ui.baijiale.ZouShiTuUI;
		private _isShenQing: boolean = false;
		private _mapinfo: BaijialeMapInfo;
		private _gridEditor: GridEditor;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._isNeedBlack = true;
			this._isClickBlack = true;
			this._isNeedDuang = false;
			this._asset = [
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				Path_game_baijiale.atlas_game_ui + "baijiale.atlas",
			];
		}

		protected init(): void {
			this._viewUI = this.createView('game_ui.baijiale.ZouShiTuUI');
			this.addChild(this._viewUI);

			let textureTypes = {
				"X": PathGameTongyong.ui_tongyong_general + "tu_lq.png",//闲
				"Z": PathGameTongyong.ui_tongyong_general + "tu_yq2.png",//庄
				"1": PathGameTongyong.ui_tongyong_general + "plsz_1.png",//和数量
				"2": PathGameTongyong.ui_tongyong_general + "plsz_2.png",
				"3": PathGameTongyong.ui_tongyong_general + "plsz_3.png",
				"4": PathGameTongyong.ui_tongyong_general + "plsz_4.png",
				"5": PathGameTongyong.ui_tongyong_general + "plsz_5.png",
				"6": PathGameTongyong.ui_tongyong_general + "plsz_6.png",
				"7": PathGameTongyong.ui_tongyong_general + "plsz_7.png",
				"8": PathGameTongyong.ui_tongyong_general + "plsz_8.png",
				"9": PathGameTongyong.ui_tongyong_general + "plsz_9.png",
			}
			this._gridEditor = new GridEditor(38.9, 38.9, 20, 6, textureTypes, false)
			this._gridEditor.x = 1.2;
			this._gridEditor.y = 1.4;
			this._viewUI.box_road.addChild(this._gridEditor);

			this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_ROAD_RECORD, this, this.onUpdateRoadInfo);
			this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);
			this.onUpdateRoadInfo();
			this.onUpdateRecord();
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.list_record.itemRender = this.createChildren("game_ui.baijiale.component.RecordRenderUI", MapRecordRender);
			this._viewUI.list_record.renderHandler = new Handler(this, this.renderHandler1);

			this._mapinfo = this._game.sceneObjectMgr.mapInfo as BaijialeMapInfo;
			if (this._mapinfo) {
				this.onUpdateRoadInfo();
				this.onUpdateRecord();
			}
		}

		private renderHandler1(cell: MapRecordRender, index: number) {
			if (cell) {
				cell.setData(this._game, cell.dataSource);
			}
		}

		//最近游戏记录
		private onUpdateRecord(): void {
			if (!this._mapinfo) return;
			let recordArr = [];
			if (this._mapinfo.GetGameRecord() != "") {
				recordArr = JSON.parse(this._mapinfo.GetGameRecord());
			}
			this._viewUI.list_record.dataSource = recordArr;

			let gameNum = 20;//recordArr.length
			this._viewUI.txt_title.text = StringU.substitute("近{0}局胜负", gameNum);
			//计算最近20场胜负
			let xianWin = 0;
			let zhuangWin = 0;
			for (let i = 0; i < recordArr.length; i++) {
				if (recordArr[i] == 0)
					xianWin++;
				if (recordArr[i] == 1)
					zhuangWin++;
			}
			this._viewUI.txt_xian.text = Math.round(xianWin * 100 / gameNum) + "%";
			this._viewUI.txt_zhuang.text = Math.round(zhuangWin * 100 / gameNum) + "%";
		}

		//大路
		private onUpdateRoadInfo(): void {
			if (!this._mapinfo) return;
			let recordArr = [];//战绩记录器
			if (this._mapinfo.GetRoadRecord() != "") {
				recordArr = JSON.parse(this._mapinfo.GetRoadRecord());
			}
			let posArr = [];//坐标记录器
			if (this._mapinfo.GetRoadPos() != "") {
				posArr = JSON.parse(this._mapinfo.GetRoadPos());
			}
			let arr = [];
			if (recordArr && recordArr.length) {
				for (let i = 0; i < recordArr.length; i++) {
					arr.push(posArr[i][0]);
					arr.push(posArr[i][1]);
					arr.push(recordArr[i]);
				}
			}
			this._gridEditor.setData(arr)
		}

		public close(): void {
			if (this._viewUI) {
				this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_ROAD_RECORD, this, this.onUpdateRoadInfo);
				this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);
				this._mapinfo = null;
			}

			super.close();
		}
	}
	class MapRecordRender extends ui.ajqp.game_ui.baijiale.component.RecordRenderUI {
		private _game: Game;
		private _data: any;
		constructor() {
			super();
		}
		setData(game: Game, data: any) {
			this._game = game;
			this._data = data;
			if (this._data != 0 && this._data != 1 && this._data != 2) {
				this.visible = false;
				return;
			}
			this.visible = true;
			this.record.skin = StringU.substitute(Path_game_baijiale.ui_baijiale + "zs_{0}.png", this._data);
		}
		destroy() {
			super.destroy();
		}
	}
}