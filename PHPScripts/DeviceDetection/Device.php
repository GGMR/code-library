<?php

	/*
	 * File				: device.php
	 * Author			: GGMR dev / Barry Jones (barry@OnAllDevices.com)
	 * Purpose			: This class provides information about the requesting device
	 *                    It provides a uniform interface for device detection libraries.
	 *                    Current detection library: class.mdetect.php
	 *                    URL: MobileESP - http://blog.mobileesp.com/?page_id=53)
	*/
	class Device
	{

		// Device properties
		public $is_smartdevice  = null;
		public $is_smarttablet  = null;
		public $is_smartphone   = null;
		public $is_featurephone = null;
		public $is_desktop      = null;

		public $is_ie           = null;
		public $ie_version      = null;

		public $is_ios          = null;
		public $ios_version     = null;

		public $is_android      = null;
		public $android_version = null;

		public $ua              = null;
		private $lib            = null;

		protected $ci           = null;
		protected $devicebands  = array('desktop', 'smartphone', 'smarttablet', 'featurephone');

		function __construct($ua = false){

			// Check mdetect library included
			require_once ('mdetect.php');

			// Create mdetect library object for the current UA
			$this->lib      = new uagent_info();
			$this->ua       = ($ua ? $ua : $this->lib->Get_Uagent());

			// Get the device properties
			if (!$this->_analyseThisDevice()){
					$this->_setDefaultDeviceProperties();
			}
			
			// Are we forcing a device override?
			$v_device_or = false;
			if (isset($_GET['device']) && in_array($_GET['device'], $this->devicebands)){
				$v_device_or = $_GET['device'];
			} 
			
			if ($v_device_or){
				$this->is_desktop       = ($v_device_or == 'desktop');
				$this->is_featurephone  = ($v_device_or == 'featurephone');
				$this->is_smartphone    = ($v_device_or == 'smartphone');
				$this->is_smarttablet   = ($v_device_or == 'smarttablet');
				$this->is_smartdevice   = ($this->is_smartphone || $this->is_smarttablet);
			}

		}

		// Set the default device properties.  Usually only if we cannot detect the device at all
		// Default to featurephone
		private function _setDefaultDeviceProperties(){
			$this->is_desktop       = false;
			$this->is_featurephone  = true;
			$this->is_smartphone    = false;
			$this->is_smarttablet   = false;
		} // _setDefaultDeviceProperties()


		// Refresh the device properties from the mdetect device database
		protected function _analyseThisDevice(){
			$this->last_error = '';
			try {

				// Set local properties
				$this->is_smarttablet   = !!$this->lib->DetectTierTablet();
				$this->is_smartphone    = !!$this->lib->DetectTierIphone();
				$this->is_featurephone  = !!(!$this->lib->DetectTierIphone() && $this->lib->DetectMobileLong());
				$this->is_desktop       = !!(!$this->lib->DetectMobileLong() && !$this->lib->DetectTierTablet());
				$this->is_smartdevice   = ($this->is_smarttablet || $this->is_smartphone);

				// Internet Exploder
				$this->is_ie = (stripos($this->ua, 'msie') !== false);
				if ($this->is_ie){
					for ($i = 6; $i <= 15; $i++){
						if (stripos($this->ua, 'msie '.$i) !== false){
							$this->ie_version = $i; break;
						}
					}
					if (!!$this->ie_version){
						$this->ie_version = 0;
					}
				}

				// iOS properties
				$this->is_ios = !!$this->lib->DetectIos();
				if ($this->is_ios){
					preg_match('/os \d+(?:_\d+)*/', $this->ua, $a);
					if (count($a) > 0){
						$this->ios_version = floatval(str_replace('_', '.', str_replace('os ', '', $a[0])));
					} else {
						$this->ios_version = 0;
					}
				}

				// Android properties
				$this->is_android = !!$this->lib->DetectAndroid();
				if ($this->is_android){
					preg_match('/android \d+(?:\.\d+)*/', $this->ua, $a);
					if (count($a) > 0){
						$this->android_version = floatval(str_replace('android ', '', $a[0]));
					} else {
						$this->android_version = 0;
					}
				}

				// Opera mobile on tablet
				if (stripos($this->ua, 'opera tablet') !== false){
					$this->is_smarttablet   = true;
					$this->is_smartphone    = false;
					$this->is_featurephone  = false;
					$this->is_desktop       = false;
					$this->is_smartdevice	= true;
				}
				
				$this->deviceinfo = array(
					"is_desktop"        => $this->is_desktop,
					"is_featurephone"   => $this->is_featurephone,
					"is_smartphone"     => $this->is_smartphone,
					"is_smarttablet"    => $this->is_smarttablet,
					"is_smartdevice"    => $this->is_smartdevice,
					"is_ie"             => $this->is_ie,
					"ie_version"        => $this->ie_version,
					"is_ios"            => $this->is_ios,
					"ios_version"       => $this->ios_version,
					"is_android"        => $this->is_android,
					"android_version"   => $this->android_version
				);

			} catch(Exception $e) {
				$this->last_error = $e->getMessage();
			}
			return (strlen($this->last_error) == 0);
		} // _analyseThisDevice()


	}
