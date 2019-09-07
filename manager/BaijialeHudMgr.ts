/**
* name 
*/
module gamebaijiale.manager {
	export class BaijialeHudMgr extends gamecomponent.managers.BaseMgr {
		static readonly EVENT_RETURN_MAPINFO: string = "BaijialeHudMgr.RETURN_MAPINFO";
		private _data: any = [];
		constructor(game: Game) {
			super(game)
			this._delta = 3000;
			this._game.network.addHanlder(Protocols.SMSG_BAIJIALE_RETURN_MAPINFO, this, this.onOptHandler);
		}

		public get data() {
			return this._data;
		}

		private onOptHandler(optcode: number, msg: any): void {
			let mapRecord1 = [];
			if (msg.record1 != "") mapRecord1 = JSON.parse(msg.record1);
			let mapPos1 = [];
			if (msg.pos1 != "") mapPos1 = JSON.parse(msg.pos1);
			let data1 = [msg.status1, msg.countdown1, mapRecord1, mapPos1]

			let mapRecord2 = [];
			if (msg.record2 != "") mapRecord2 = JSON.parse(msg.record2);
			let mapPos2 = [];
			if (msg.pos2 != "") mapPos2 = JSON.parse(msg.pos2);
			let data2 = [msg.status2, msg.countdown2, mapRecord2, mapPos2]

			let mapRecord3 = [];
			if (msg.record3 != "") mapRecord3 = JSON.parse(msg.record3);
			let mapPos3 = [];
			if (msg.pos3 != "") mapPos3 = JSON.parse(msg.pos3);
			let data3 = [msg.status3, msg.countdown3, mapRecord3, mapPos3]

			let mapRecord4 = [];
			if (msg.record4 != "") mapRecord4 = JSON.parse(msg.record4);
			let mapPos4 = [];
			if (msg.pos4 != "") mapPos4 = JSON.parse(msg.pos4);
			let data4 = [msg.status4, msg.countdown4, mapRecord4, mapPos4]

			this._data = [data1, data2, data3, data4];
			this.event(BaijialeHudMgr.EVENT_RETURN_MAPINFO);
		}

		/**
		 * 帧间隔心跳
		 */
		deltaUpdate() {
			this._game.network.call_baijiale_get_mapinfo()
		}

		clear() {
			Laya.timer.clearAll(this);
			this._game.network.removeHanlder(Protocols.SMSG_BAIJIALE_RETURN_MAPINFO, this, this.onOptHandler);
			super.clear();
		}
	}
}