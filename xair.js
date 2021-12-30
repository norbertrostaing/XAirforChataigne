// using https://wiki.munichmakerlab.de/images/1/17/UNOFFICIAL_X32_OSC_REMOTE_PROTOCOL_(1).pdf
/*

*/
var myParameters = {};

function init() {
	local.values.addContainer("Meters");
	local.values.removeContainer("UI");
	local.values.addContainer("UI");
	for (var i = 0; i < meters.length; i++) {
		var n = meters[i];
		var p = local.values.getChild("Meters").addFloatParameter(n,n,0,0,1);
	}

}

var meters = [
	"in1", "in2", "in3", "in4", "in5", "in6", "in7", "in8", "in9", "in10", "in11", "in12", "in13", "in14", "in15", "in16",
	"aux1", "aux2", "Fx1L", "Fx1R", "Fx2L", "Fx2R", "Fx3L", "Fx3R", "Fx4L", "Fx4R", 
	"bus1", "bus2", "bus3","bus4", "bus5", "bus6", 
	"st1", "st2",
	"mon1", "mon2"
	];


function oscEvent(address, args) {
	var arrayAddress = address.split("/");
	if (address == "/meters/1") {
		for(var i=0; i < args.length; i++) {
			var data = args[i];
			for (var j = 4; j+1< data.length; j=j+2) {
				var index = parseInt(Math.floor(j/2))-2;
				if (index < meters.length) {
					var f = bytesToShort([data[j+0], data[j+1]]);
					// script.log(f);
					var n = meters[index];
					local.values.getChild("Meters").getChild(n).set(f);
				}
			}
		}
	} else {
		script.log(address);
		if (["ch"].indexOf(arrayAddress[1])>=0) {
			setValue(arrayAddress, args[0]);
		}
	}
}

function bytesToFloat(bytes) {
    // JavaScript bitwise operators yield a 32 bits integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = bytes[3]<<24 ;//| bytes[2]<<16 | bytes[1]<<8 | bytes[0];
    bits = bits | bytes[2]<<16;
    bits = bits | bytes[1]<<8;
    bits = bits | bytes[0];

    var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
    var e = bits>>>23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
  }

var l = Math.pow(2,15);;
function bytesToShort(b) {
	var val = (b[1]-128)*256 ;
	val += b[0];
	val = val/l;
	// script.log(val+ " -- "+b[0]);
	return val;
}

function update(deltaTime) {
	var now = util.getTime();
	if (now > TSSendAlive) {
		TSSendAlive = now + 3;
		keepAlive();
	}
}

function keepAlive() {
	local.send("/meters", "/meters/1");
	local.send("/xremote");
}

function setValue(address, val) {
	var currentContainer = local.values.getChild("UI");
	for (var i = 1; i< address.length-1; i++) {
		var container = currentContainer.getChild(address[i]);
		if (container == null) {
			currentContainer.addContainer(address[i]);
		}
		currentContainer = container;
	}
	var name = address[address.length-1];
	var param = currentContainer.getChild(name);
	if (param == null) {
		if (parseFloat(val) == val) {
			param = currentContainer.addFloatParameter(name, name,0,0,1);
		} else {
			param = currentContainer.addStringParameter(name, name, "");
		}
	}
	param.set(val);

}

///  Generic controller


function generic_config_name(targetType, targetNumber, value) {
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/config/name", value);
}

function generic_config_icon(targetType, targetNumber, value) { // // /ch/XX/config/icon int [1...74] (see appendix for a list of icons) 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/config/icon", value);
}

function generic_config_color(targetType, targetNumber, value) { // // /ch/XX/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; }
	local.send("/"+targetType+"/"+targetNumber+"/config/color", value);
}

function generic_config_source(targetType, targetNumber, value) { // // /ch/XX/config/source int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/config/source", value);
}

function generic_delay_on(targetType, targetNumber, value) { // // /ch/XX/delay/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/delay/on", value);
}

function generic_delay_time(targetType, targetNumber, value) { // // /ch/XX/delay/time linf [0.300, 500.000, 0.100] ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/delay/time", value);
}

function generic_preamp_trim(targetType, targetNumber, value) { // // /ch/XX/preamp/trim linf [-18.000, 18.000, 0.250] (digital sources only) dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/preamp/trim", value);
}

function generic_preamp_invert(targetType, targetNumber, value) { // // /ch/XX/preamp/invert enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/preamp/invert", value);
}

function generic_preamp_hpon(targetType, targetNumber, value) { // // /ch/XX/preamp/hpon enum {OFF, ON}Sets Phantom power off or on 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/preamp/hpon", value);
}

function generic_preamp_hpslope(targetType, targetNumber, value) { // // /ch/XX/preamp/hpslope enum {12, 18, 24} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/preamp/hpslope", value);
}

function generic_preamp_hpf(targetType, targetNumber, value) { // // /ch/XX/preamp/hpf logf [20.000, 400.000, 101]10Hz 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/preamp/hpf", value);
}

function generic_gate_on(targetType, targetNumber, value) { // // /ch/XX/gate/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/on", value);
}

function generic_gate_mode(targetType, targetNumber, value) { // // /ch/XX/gate/mode enum int [0...4] representing  {EXP2, EXP3, EXP4, GATE, DUCK} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/mode", value);
}

function generic_gate_thr(targetType, targetNumber, value) { // // /ch/XX/gate/thr linf [-80.000, 0.000, 0.500] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/thr", value);
}

function generic_gate_range(targetType, targetNumber, value) { // // /ch/XX/gate/range linf [3.000, 60.000, 1.000] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/range", value);
}

function generic_gate_attack(targetType, targetNumber, value) { // // /ch/XX/gate/attack linf [0.000, 120.000, 1.000] ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/attack", value);
}

function generic_gate_hold(targetType, targetNumber, value) { // // /ch/XX/gate/hold logf [0.020, 2000, 101]11ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/hold", value);
}

function generic_gate_release(targetType, targetNumber, value) { // // /ch/XX/gate/release logf [5.000, 4000.000, 101]12ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/release", value);
}

function generic_gate_keysrc(targetType, targetNumber, value) { // // /ch/XX/gate/keysrc int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/keysrc", value);
}

function generic_gate_filter(targetType, targetNumber, value) { // // /ch/XX/gate/filter/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/filter/on", value);
}

function generic_gate_filter(targetType, targetNumber, value) { // // /ch/XX/gate/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/filter/type", value);
}

function generic_gate_filter(targetType, targetNumber, value) { // // /ch/XX/gate/filter/f Logf [20.000, 20000, 201]13Hz 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/gate/filter/f", value);
}

function generic_dyn_on(targetType, targetNumber, value) { // // /ch/XX/dyn/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/on", value);
}

function generic_dyn_mode(targetType, targetNumber, value) { // // /ch/XX/dyn/mode enum {COMP, EXP} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	// /ch/XX/dyn/mode enum {COMP, EXP} 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/mode", value);
}

function generic_dyn_det(targetType, targetNumber, value) { // // /ch/XX/dyn/det enum {PEAK, RMS} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/det", value);
}

function generic_dyn_env(targetType, targetNumber, value) { // // /ch/XX/dyn/env enum {LIN, LOG} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/env", value);
}

function generic_dyn_thr(targetType, targetNumber, value) { // // /ch/XX/dyn/thr linf [-60.000, 0.000, 0.500] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/thr", value);
}

function generic_dyn_ratio(targetType, targetNumber, value) { // // /ch/XX/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100} 10 See Appendix section for detailed values 11 See Appendix section for detailed values 12 See Appendix section for detailed values 13 See Appendix section for detailed values 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/ratio", value);
}

function generic_dyn_knee(targetType, targetNumber, value) { // // /ch/XX/dyn/knee linf [0.000, 5.000, 1.000] 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/knee", value);
}

function generic_dyn_mgain(targetType, targetNumber, value) { // // /ch/XX/dyn/mgain linf [0.000, 24.000, 0.500] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/mgain", value);
}

function generic_dyn_attack(targetType, targetNumber, value) { // // /ch/XX/dyn/attack linf [0.000, 120.000, 1.000] ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/attack", value);
}

function generic_dyn_hold(targetType, targetNumber, value) { // // /ch/XX/dyn/hold logf [0.020, 2000, 101] ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/hold", value);
}

function generic_dyn_release(targetType, targetNumber, value) { // // /ch/XX/dyn/release logf [5.000, 4000.000, 101] ms 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/release", value);
}

function generic_dyn_pos(targetType, targetNumber, value) { // // /ch/XX/dyn/pos enum {PRE, POST} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/pos", value);
}

function generic_dyn_keysrc(targetType, targetNumber, value) { // // /ch/XX/dyn/keysrc int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/keysrc", value);
}

function generic_dyn_mix(targetType, targetNumber, value) { // // /ch/XX/dyn/mix linf [0, 100, 5] % 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/mix", value);
}

function generic_dyn_auto(targetType, targetNumber, value) { // // /ch/XX/dyn/auto enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/auto", value);
}

function generic_dyn_filter(targetType, targetNumber, value) { // // /ch/XX/dyn/filter/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/filter/on", value);
}

function generic_dyn_filter(targetType, targetNumber, value) { // // /ch/XX/dyn/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/filter/type", value);
}

function generic_dyn_filter(targetType, targetNumber, value) { // // /ch/XX/dyn/filter/f logf [20.000, 20000, 201] Hz 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/dyn/filter/f", value);
}

function generic_insert_on(targetType, targetNumber, value) { // // /ch/XX/insert/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/insert/on", value);
}

function generic_insert_pos(targetType, targetNumber, value) { // // /ch/XX/insert/pos enum {PRE, POST}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/insert/pos", value);
}

function generic_insert_sel(targetType, targetNumber, value) { // // /ch/XX/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/insert/sel", value);
}

function generic_eq_on(targetType, targetNumber, value) { // // /ch/XX/eq/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/eq/on", value);
}

function generic_eq_type(targetType, targetNumber, band, value) { // // /ch/XX/eq/1_4/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; }
	local.send("/"+targetType+"/"+targetNumber+"/eq/"+band+"/type", value);
}

function generic_eq_f(targetType, targetNumber, band, value) { // // /ch/XX/eq/1_4/f logf [20.000, 20000, 201] Hz 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/eq/"+band+"/f", value);
}

function generic_eq_g(targetType, targetNumber, band, value) { // // /ch/XX/eq/1_4/g linf [-15.000, 15.000, 0.250] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/eq/"+band+"/g", value);
}

function generic_eq_q(targetType, targetNumber, band, value) { // // /ch/XX/eq/1_4/q logf [10.000, 0.3, 72] 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/eq/"+band+"/q", value);
}

function generic_mix_on(targetType, targetNumber, value) { // // /ch/XX/mix/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/on", value);
}

function generic_mix_fader(targetType, targetNumber, value) { // // /ch/XX/mix/fader level [0.0...1.0(+10dB), 1024] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/fader", value);
}

function generic_mix_st(targetType, targetNumber, value) { // // /ch/XX/mix/st enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/st", value);
}

function generic_mix_pan(targetType, targetNumber, value) { // // /ch/XX/mix/pan linf [-100.000, 100.000, 2.000] 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/pan", value);
}

function generic_mix_mono(targetType, targetNumber, value) { // // /ch/XX/mix/mono enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/mono", value);
}

function generic_mix_mlevel(targetType, targetNumber, value) { // // /ch/XX/mix/mlevel level [0.0...1.0 (+10 dB), 161] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/mlevel", value);
}

function generic_mix_send_on(targetType, targetNumber, mix, value) { // // /ch/XX/mix/0116/on enum {OFF, ON}
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/"+mix+"/on", value);
}

function generic_mix_send_level(targetType, targetNumber, mix, value) { // // /ch/XX/mix/0116/level level [0.0...1.0 (+10 dB), 161] dB 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/"+mix+"/level", value);
}

function generic_mix_send_pan(targetType, targetNumber, mix, value) { // // /ch/XX/mix/01/pan linf [-100.000, 100.000, 2.000] 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/"+mix+"/pan", value);
}

function generic_mix_send_Type(targetType, targetNumber, mix, value) { // // /ch/XX/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP} 
	if (targetNumber < 10) {targetNumber = "0"+targetNumber; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/"+targetType+"/"+targetNumber+"/mix/"+mix+"/pan", value);
}










// channel control

function channel_config_name(channel, value) {
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/config/name", value);
}

function channel_config_icon(channel, value) { // // /ch/XX/config/icon int [1...74] (see appendix for a list of icons) 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/config/icon", value);
}

function channel_config_color(channel, value) { // // /ch/XX/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi} 
	if (channel < 10) {channel = "0"+channel; }
	local.send("/ch/"+channel+"/config/color", value);
}

function channel_config_source(channel, value) { // // /ch/XX/config/source int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/config/source", value);
}

function channel_delay_on(channel, value) { // // /ch/XX/delay/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/delay/on", value);
}

function channel_delay_time(channel, value) { // // /ch/XX/delay/time linf [0.300, 500.000, 0.100] ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/delay/time", value);
}

function channel_preamp_trim(channel, value) { // // /ch/XX/preamp/trim linf [-18.000, 18.000, 0.250] (digital sources only) dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/preamp/trim", value);
}

function channel_preamp_invert(channel, value) { // // /ch/XX/preamp/invert enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/preamp/invert", value);
}

function channel_preamp_hpon(channel, value) { // // /ch/XX/preamp/hpon enum {OFF, ON}Sets Phantom power off or on 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/preamp/hpon", value);
}

function channel_preamp_hpslope(channel, value) { // // /ch/XX/preamp/hpslope enum {12, 18, 24} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/preamp/hpslope", value);
}

function channel_preamp_hpf(channel, value) { // // /ch/XX/preamp/hpf logf [20.000, 400.000, 101]10Hz 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/preamp/hpf", value);
}

function channel_gate_on(channel, value) { // // /ch/XX/gate/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/on", value);
}

function channel_gate_mode(channel, value) { // // /ch/XX/gate/mode enum int [0...4] representing  {EXP2, EXP3, EXP4, GATE, DUCK} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/mode", value);
}

function channel_gate_thr(channel, value) { // // /ch/XX/gate/thr linf [-80.000, 0.000, 0.500] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/thr", value);
}

function channel_gate_range(channel, value) { // // /ch/XX/gate/range linf [3.000, 60.000, 1.000] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/range", value);
}

function channel_gate_attack(channel, value) { // // /ch/XX/gate/attack linf [0.000, 120.000, 1.000] ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/attack", value);
}

function channel_gate_hold(channel, value) { // // /ch/XX/gate/hold logf [0.020, 2000, 101]11ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/hold", value);
}

function channel_gate_release(channel, value) { // // /ch/XX/gate/release logf [5.000, 4000.000, 101]12ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/release", value);
}

function channel_gate_keysrc(channel, value) { // // /ch/XX/gate/keysrc int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/keysrc", value);
}

function channel_gate_filter_on(channel, value) { // // /ch/XX/gate/filter/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/filter/on", value);
}

function channel_gate_filter_type(channel, value) { // // /ch/XX/gate/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/filter/type", value);
}

function channel_gate_filter_f(channel, value) { // // /ch/XX/gate/filter/f Logf [20.000, 20000, 201]13Hz 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/gate/filter/f", value);
}

function channel_dyn_on(channel, value) { // // /ch/XX/dyn/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/on", value);
}

function channel_dyn_mode(channel, value) { // // /ch/XX/dyn/mode enum {COMP, EXP} 
	if (channel < 10) {channel = "0"+channel; } 
	// /ch/XX/dyn/mode enum {COMP, EXP} 
	local.send("/ch/"+channel+"/dyn/mode", value);
}

function channel_dyn_det(channel, value) { // // /ch/XX/dyn/det enum {PEAK, RMS} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/det", value);
}

function channel_dyn_env(channel, value) { // // /ch/XX/dyn/env enum {LIN, LOG} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/env", value);
}

function channel_dyn_thr(channel, value) { // // /ch/XX/dyn/thr linf [-60.000, 0.000, 0.500] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/thr", value);
}

function channel_dyn_ratio(channel, value) { // // /ch/XX/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100} 10 See Appendix section for detailed values 11 See Appendix section for detailed values 12 See Appendix section for detailed values 13 See Appendix section for detailed values 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/ratio", value);
}

function channel_dyn_knee(channel, value) { // // /ch/XX/dyn/knee linf [0.000, 5.000, 1.000] 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/knee", value);
}

function channel_dyn_mgain(channel, value) { // // /ch/XX/dyn/mgain linf [0.000, 24.000, 0.500] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/mgain", value);
}

function channel_dyn_attack(channel, value) { // // /ch/XX/dyn/attack linf [0.000, 120.000, 1.000] ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/attack", value);
}

function channel_dyn_hold(channel, value) { // // /ch/XX/dyn/hold logf [0.020, 2000, 101] ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/hold", value);
}

function channel_dyn_release(channel, value) { // // /ch/XX/dyn/release logf [5.000, 4000.000, 101] ms 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/release", value);
}

function channel_dyn_pos(channel, value) { // // /ch/XX/dyn/pos enum {PRE, POST} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/pos", value);
}

function channel_dyn_keysrc(channel, value) { // // /ch/XX/dyn/keysrc int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/keysrc", value);
}

function channel_dyn_mix(channel, value) { // // /ch/XX/dyn/mix linf [0, 100, 5] % 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/mix", value);
}

function channel_dyn_auto(channel, value) { // // /ch/XX/dyn/auto enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/auto", value);
}

function channel_dyn_filter_on(channel, value) { // // /ch/XX/dyn/filter/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/filter/on", value);
}

function channel_dyn_filter_type(channel, value) { // // /ch/XX/dyn/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/filter/type", value);
}

function channel_dyn_filter_f(channel, value) { // // /ch/XX/dyn/filter/f logf [20.000, 20000, 201] Hz 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/dyn/filter/f", value);
}

function channel_insert_on(channel, value) { // // /ch/XX/insert/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/insert/on", value);
}

function channel_insert_pos(channel, value) { // // /ch/XX/insert/pos enum {PRE, POST}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/insert/pos", value);
}

function channel_insert_sel(channel, value) { // // /ch/XX/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6} 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/insert/sel", value);
}

function channel_eq_on(channel, value) { // // /ch/XX/eq/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/eq/on", value);
}

function channel_eq_type(channel, band, value) { // // /ch/XX/eq/1_4/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut} 
	if (channel < 10) {channel = "0"+channel; }
	local.send("/ch/"+channel+"/eq/"+band+"/type", value);
}

function channel_eq_f(channel, band, value) { // // /ch/XX/eq/1_4/f logf [20.000, 20000, 201] Hz 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/eq/"+band+"/f", value);
}

function channel_eq_g(channel, band, value) { // // /ch/XX/eq/1_4/g linf [-15.000, 15.000, 0.250] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/eq/"+band+"/g", value);
}

function channel_eq_q(channel, band, value) { // // /ch/XX/eq/1_4/q logf [10.000, 0.3, 72] 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/eq/"+band+"/q", value);
}

function channel_mix_on(channel, value) { // // /ch/XX/mix/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/mix/on", value);
}

function channel_mix_fader(channel, value) { // // /ch/XX/mix/fader level [0.0...1.0(+10dB), 1024] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/mix/fader", value);
}

function channel_mix_st(channel, value) { // // /ch/XX/mix/st enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/mix/st", value);
}

function channel_mix_pan(channel, value) { // // /ch/XX/mix/pan linf [-100.000, 100.000, 2.000] 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/mix/pan", value);
}

function channel_mix_mono(channel, value) { // // /ch/XX/mix/mono enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/mix/mono", value);
}

function channel_mix_mlevel(channel, value) { // // /ch/XX/mix/mlevel level [0.0...1.0 (+10 dB), 161] dB 
	if (channel < 10) {channel = "0"+channel; } 
	local.send("/ch/"+channel+"/mix/mlevel", value);
}

function channel_mix_on(channel, mix, value) { // // /ch/XX/mix/0116/on enum {OFF, ON}
	if (channel < 10) {channel = "0"+channel; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/ch/"+channel+"/mix/"+mix+"/on", value);
}

function channel_mix_send_level(channel, mix, value) { // // /ch/XX/mix/0116/level level [0.0...1.0 (+10 dB), 161] dB 
	if (channel < 10) {channel = "0"+channel; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/ch/"+channel+"/mix/"+mix+"/level", value);
}

function channel_mix_send_pan(channel, mix, value) { // // /ch/XX/mix/01/pan linf [-100.000, 100.000, 2.000] 
	if (channel < 10) {channel = "0"+channel; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/ch/"+channel+"/mix/"+mix+"/pan", value);
}

function channel_mix_send_Type(channel, mix, value) { // // /ch/XX/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP} 
	if (channel < 10) {channel = "0"+channel; } 
	if (mix < 10) {mix = "0"+mix; } 
	local.send("/ch/"+channel+"/mix/"+mix+"/pan", value);
}


/*


/auxin/[01...08]/config/name string [12] 
/auxin/[01...08]/config/icon int [1...74] (see appendix for a list of icons) 
/auxin/[01...08]/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}
/auxin/[01...08]/config/source int int with value [0...64] representing {OFF, In01...32,Aux 1...6,USB L, USB R,  Fx 1L...Fx4R, Bus 01...16}
/auxin/[01...08]/preamp/trim linf [-18.000, 18.000, 0.250] dB 
/auxin/[01...08]/preamp/invert enum {OFF, ON}
/auxin/[01...08]/eq/on enum {OFF, ON}
/auxin/[01...08]/eq/[1...4]/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut}
/auxin/[01...08]/eq/[1...4]/f logf [20.000, 20000, 201] Hz/dB 
/auxin/[01...08]/eq/[1...4]/g linf [-15.000, 15.000, 0.250] 
/auxin/[01...08]/eq/[1...4]/q logf [10.000, 0.3, 72] 
/auxin/[01...08]/mix/on enum {OFF, ON}
/auxin/[01...08]/mix/fader level [0.0...1.0(+10dB), 1024] 
/auxin/[01...08]/mix/st enum {OFF, ON}
/auxin/[01...08]/mix/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/mono enum {OFF, ON}
/auxin/[01...08]/mix/mlevel level [0.0...1.0 (+10 dB), 161] 
/auxin/[01...08]/mix/[01...16]/on enum {OFF, ON}
/auxin/[01...08]/mix/[01...16]/level level [0.0...1.0 (+10 dB), 161] 
/auxin/[01...08]/mix/01/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/03/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/03/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/05/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/05/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/07/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/07/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/09/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/09/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/11/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/11/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/13/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/13/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/mix/15/pan linf [-100.000, 100.000, 2.000] 
/auxin/[01...08]/mix/15/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST, GRP}
/auxin/[01...08]/grp/dca %int [0, 255] (bitmap)
/auxin/[01...08]/grp/mute %int [0, 63] (bitmap)




/bus/[01...16]/config/name string [12] 
/bus/[01...16]/config/icon int [1...74] (see appendix for a list of icons) 
/bus/[01...16]/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}
/bus/[01...16]/dyn/on enum {OFF, ON}
/bus/[01...16]/dyn/mode enum {COMP, EXP}
/bus/[01...16]/dyn/det enum {PEAK, RMS}
/bus/[01...16]/dyn/env enum {LIN, LOG}
/bus/[01...16]/dyn/thr linf [-60.000, 0.000, 0.500] dB 
/bus/[01...16]/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}
/bus/[01...16]/dyn/knee linf [0.000, 5.000, 1.000] 
/bus/[01...16]/dyn/mgain linf [0.000, 24.000, 0.500] dB 
/bus/[01...16]/dyn/attack linf [0.000, 120.000, 1.000] ms 
/bus/[01...16]/dyn/hold logf [0.020, 2000, 101] ms 
/bus/[01...16]/dyn/release logf [5.000, 4000.000, 101] ms 
/bus/[01...16]/dyn/pos enum {PRE, POST}
/bus/[01...16]/dyn/keysrc int int with value [0...64] representing {OFF, In01...32, Aux 1...6, USB L, USB R,  Fx 1L...Fx 4R, Bus 01...16}
/bus/[01...16]/dyn/mix linf [0, 100, 5] % 
/bus/[01...16]/dyn/auto15enum {OFF, ON}
/bus/[01...16]/dyn/filter/on enum {OFF, ON}
/bus/[01...16]/dyn/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0}
/bus/[01...16]/dyn/filter/f logf [20.000, 20000, 201] Hz 
/bus/[01...16]/insert/on enum {OFF, ON}
/bus/[01...16]/insert/pos enum {PRE, POST}
/bus/[01...16]/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6}
/bus/[01...16]/eq/on enum {OFF, ON}
/bus/[01...16]/eq/[1...6]/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut}
/bus/[01...16]/eq/[1...6]/f logf [20.000, 20000, 201] Hz 
/bus/[01...16]/eq/[1...6]/g linf [-15.000, 15.000, 0.250] dB 
/bus/[01...16]/eq/[1...6]/q logf [10.000, 0.3, 72] 
/bus/[01...16]/mix/on enum {OFF, ON}15 This command is available starting with FW 2.10 
/bus/[01...16]/mix/fader level [0.0...1.0(+10dB), 1024] dB 
/bus/[01...16]/mix/st enum {OFF, ON}
/bus/[01...16]/mix/pan linf [-100.000, 100.000, 2.000] 
/bus/[01...16]/mix/mono enum {OFF, ON}
/bus/[01...16]/mix/mlevel level [0.0...1.0(+10dB), 161] dB 
/bus/[01...16]/mix/[01...06]/on enum {OFF, ON}
/bus/[01...16]/mix/[01...06]/level level [0.0...1.0(+10dB), 161] dB 
/bus/[01...16]/mix/01/pan linf [-100.000, 100.000, 2.000] 
/bus/[01...16]/mix/03/pan linf [-100.000, 100.000, 2.000] 
/bus/[01...16]/mix/05/pan linf [-100.000, 100.000, 2.000] 
/bus/[01...16]/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
/bus/[01...16]/mix/03/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
/bus/[01...16]/mix/05/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
/bus/[01...16]/grp/dca %int [0, 255] (bitmap) 
/bus/[01...16]/grp/mute %int [0, 63] (bitmap)


/mtx/[01...06]/config/name string [12] 
/mtx/[01...06]/config/icon int [1...74] (see appendix for a list of icons) 
/mtx/[01...06]/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}
/mtx/[01...06]/config/preamp/invert enum {OFF, ON}
/mtx/[01...06]/dyn/on enum {OFF, ON}
/mtx/[01...06]/dyn/mode enum {COMP, EXP}
/mtx/[01...06]/dyn/det enum {PEAK, RMS}
/mtx/[01...06]/dyn/env enum {UN, LOG}
/mtx/[01...06]/dyn/thr linf [-60.000, 0.000, 0.500] dB 
/mtx/[01...06]/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}
/mtx/[01...06]/dyn/knee linf [0.000, 5.000, 1.000] 
/mtx/[01...06]/dyn/mgain linf [0.000, 24.000, 0.500] dB 
/mtx/[01...06]/dyn/attack linf [0.000, 120.000, 1.000] ms 
/mtx/[01...06]/dyn/hold logf [0.020, 2000, 101] ms 
/mtx/[01...06]/dyn/release logf [5.000, 4000.000, 101] ms 
/mtx/[01...06]/dyn/pos enum {PRE, POST}
/mtx/[01...06]/dyn/mix linf [0, 100, 5] % 
/mtx/[01...06]/dyn/auto16enum {OFF, ON}
/mtx/[01...06]/dyn/filter/on enum {OFF, ON}
/mtx/[01...06]/dyn/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0}
/mtx/[01...06]/dyn/filter/f logf [20.000, 20000, 201] Hz 
/mtx/[01...06]/insert/on enum {OFF, ON}
/mtx/[01...06]/insert/pos enum {PRE, POST}
/mtx/[01...06]/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6}
/mtx/[01...06]/eq/on enum {OFF, ON}
/mtx/[01...06]/eq/[1...6]/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut}For /mtx/01/ and mtx/06/ type extends to int [0...13] adding {BU6, BU12, BS12, LR12, BU18, BU24, BS24, LR24}. In that case /mtx/02/ and /mtx/05/ are ignored, repectively. 
/mtx/[01...06]/eq/[1...6]/f logf [20.000, 20000, 201] Hz 
/mtx/[01...06]/eq/[1...6]/g linf [-15.000, 15.000, 0.250] dB 
/mtx/[01...06]/eq/[1...6]/q logf [10.000, 0.3, 72] 16 This command is available starting with FW 2.10 
/mtx/[01...06]/mix/on enum {OFF, ON}
/mtx/[01...06]/mix/fader level [0.0...1.0(+10dB), 1024]


/main/st/config/name string [12] 
 /main/m/config/name string [12] 

/main/st/config/icon Int [1...74] (see appendix for a list of icons) 
 /main/m/config/icon Int [1...74] (see appendix for a list of icons) 

/main/st/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}
 /main/m/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}

/main/st/dyn/on enum {OFF, ON}
 /main/m/dyn/on enum {OFF, ON}

/main/st/dyn/mode enum {COMP, EXP}
 /main/m/dyn/mode enum {COMP, EXP}

/main/st/dyn/det enum {PEAK, RMS}
 /main/m/dyn/det enum {PEAK, RMS}

/main/st/dyn/env enum {LIN, LOG}
 /main/m/dyn/env enum {LIN, LOG}

/main/st/dyn/thr linf [-60.000, 0.000, 0.500] dB 
 /main/m/dyn/thr linf [-60.000, 0.000, 0.500] dB 

/main/st/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}
 /main/m/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}

/main/st/dyn/knee linf [0.000, 5.000, 1.000] 
 /main/m/dyn/knee linf [0.000, 5.000, 1.000] 

/main/st/dyn/mgain linf [0.000, 24.000, 0.500] dB 
 /main/m/dyn/mgain linf [0.000, 24.000, 0.500] dB 

/main/st/dyn/attack linf [0.000, 120.000, 1.000] ms 
 /main/m/dyn/attack linf [0.000, 120.000, 1.000] ms 

/main/st/dyn/hold logf [0.020, 2000, 101] ms 
 /main/m/dyn/hold logf [0.020, 2000, 101] ms 

/main/st/dyn/release logf [5.000, 4000.000, 101] ms 
 /main/m/dyn/release logf [5.000, 4000.000, 101] ms 

/main/st/dyn/pos enum {PRE, POST}
 /main/m/dyn/pos enum {PRE, POST}

/main/st/dyn/mix linf [0, 100, 5] % 
 /main/m/dyn/mix linf [0, 100, 5] % 

/main/st/dyn/auto17enum {OFF, ON}
 /main/m/dyn/auto18enum {OFF, ON}

/main/st/dyn/filter/on enum {OFF, ON}
 /main/m/dyn/filter/on enum {OFF, ON}

/main/st/dyn/filter/type enum int with value [0...8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0}
 /main/m/dyn/filter/type enum int with value [0, 8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0}

/main/st/dyn/filter/f logf [20.000, 20000, 201] Hz 
 /main/m/dyn/filter/f logf [20.000, 20000, 201] Hz 

/main/st/insert/on enum {OFF, ON}
 /main/m/insert/on enum {OFF, ON}

/main/st/insert/pos enum {PRE, POST}
 /main/m/insert/pos enum {PRE, POST}

/main/st/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6}
 /main/m/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6} 

/main/st/eq/on enum {OFF, ON}
 /main/m/eq/on enum {OFF, ON}

/main/st/eq/[1...6]/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut}
 /main/m/eq/[1...6]/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut}

/main/st/eq/[1...6]/f logf [20.000, 20000, 201] Hz 
 /main/m/eq/[1...6]/f logf [20.000, 20000, 201] Hz 

/main/st/eq/[1...6]/g linf [-15.000, 15.000, 0.250] dB 
 /main/m/eq/[1...6]/g linf [-15.000, 15.000, 0.250] dB 

/main/st/eq/[1...6]/q logf [10.000, 0.3, 72] 
 /main/m/eq/[1...6]/q logf [10.000, 0.3, 72] 

/main/st/mix/on enum {OFF, ON}
 /main/m/mix/on enum {OFF, ON}

/main/st/mix/fader level [0.0...1.0(+10dB), 1024] dB 
 /main/m/mix/fader level [0.0...1.0(+10dB), 1024] dB 

/main/st/mix/pan linf [-100.000, 100.000, 2.000] 
 /main/m/mix/[01...06]/on enum {OFF, ON}

/main/st/mix/[01...06]/on enum {OFF, ON}17 This command is available starting with FW 2.10 
 /main/m/mix/[01...06]/level level [0.0...1.0(+10dB), 161] dB 18 This command is available starting with FW 2.10 

/main/st/mix/[01...06]/level level [0.0...1.0(+10dB), 161] dB 
 /main/m/mix/01/pan linf [-100.000, 100.000, 2.000] 

/main/st/mix/01/pan linf [-100.000, 100.000, 2.000] 
 /main/m/mix/03/pan linf [-100.000, 100.000, 2.000] 

/main/st/mix/03/pan linf [-100.000, 100.000, 2.000] 
 /main/m/mix/05/pan linf [-100.000, 100.000, 2.000] 

/main/st/mix/05/pan linf [-100.000, 100.000, 2.000] 
 /main/m/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }

/main/st/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
 /main/m/mix/03/ type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }

/main/st/mix/03/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
 /main/m/mix/05/ type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }

/main/st/mix/05/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }


/main/m/config/name string [12] 
/main/m/config/icon Int [1...74] (see appendix for a list of icons) 
/main/m/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}
/main/m/dyn/on enum {OFF, ON}
/main/m/dyn/mode enum {COMP, EXP}
/main/m/dyn/det enum {PEAK, RMS}
/main/m/dyn/env enum {LIN, LOG}
/main/m/dyn/thr linf [-60.000, 0.000, 0.500] dB 
/main/m/dyn/ratio enum int with value [0...11] representing {1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}
/main/m/dyn/knee linf [0.000, 5.000, 1.000] 
/main/m/dyn/mgain linf [0.000, 24.000, 0.500] dB 
/main/m/dyn/attack linf [0.000, 120.000, 1.000] ms 
/main/m/dyn/hold logf [0.020, 2000, 101] ms 
/main/m/dyn/release logf [5.000, 4000.000, 101] ms 
/main/m/dyn/pos enum {PRE, POST}
/main/m/dyn/mix linf [0, 100, 5] % 
/main/m/dyn/auto18enum {OFF, ON}
/main/m/dyn/filter/on enum {OFF, ON}
/main/m/dyn/filter/type enum int with value [0, 8] representing Keysolo (Solo/Q) {LC6, LC12, HC6, HC12, 1.0, 2.0, 3.0, 5.0, 10.0}
/main/m/dyn/filter/f logf [20.000, 20000, 201] Hz 
/main/m/insert/on enum {OFF, ON}
/main/m/insert/pos enum {PRE, POST}
/main/m/insert/sel enum int with value [0...22] representing {OFF, FX1L, FX1R, FX2L, FX2R, FX3L, FX3R, FX4L, FX4R, FX5L, FX5R, FX6L, FX6R, FX7L, FX7R, FX8L, FX8R, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6} 
/main/m/eq/on enum {OFF, ON}
/main/m/eq/[1...6]/type enum int [0...5] representing  {LCut, LShv, PEQ, VEQ, HShv, HCut}
/main/m/eq/[1...6]/f logf [20.000, 20000, 201] Hz 
/main/m/eq/[1...6]/g linf [-15.000, 15.000, 0.250] dB 
/main/m/eq/[1...6]/q logf [10.000, 0.3, 72] 
/main/m/mix/on enum {OFF, ON}
/main/m/mix/fader level [0.0...1.0(+10dB), 1024] dB 
/main/m/mix/[01...06]/on enum {OFF, ON}
/main/m/mix/[01...06]/level level [0.0...1.0(+10dB), 161] dB 18 This command is available starting with FW 2.10 
/main/m/mix/01/pan linf [-100.000, 100.000, 2.000] 
/main/m/mix/03/pan linf [-100.000, 100.000, 2.000] 
/main/m/mix/05/pan linf [-100.000, 100.000, 2.000] 
/main/m/mix/01/type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
/main/m/mix/03/ type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }
/main/m/mix/05/ type enum int [0...5] representing  {IN/LC, <-EQ, EQ->, PRE, POST }


/dca/[1...8]/on enum {OFF, ON}
/dca/[1...8]/fader level [0.0...1.0(+10dB), 1024] dB 
/dca/[1...8]/config/name string [12] 
/dca/[1...8]/config/icon Int [1...74] (see appendix for a list of icons) 
/dca/[1...8]/config/color enum int with value [0...15] representing {OFF, RD, GN, YE, BL, MG, CY, WH, OFFi, RDi, GNi, YEi, BLi, MGi, CYi, WHi}


*/
