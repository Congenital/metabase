# metabase-odps-driver

  1. 修改 modules/drivers/deps.edn，增加以下配置
		<br/>
    ```
    metabase/odps               {:local/root "odps"}
    ```
  2. clone 代码到 modules/drivers 目录
		<br/>
    ```
    git clone git@github.com:Congenital/metabase-odps-driver.git
    ```
  3. 编译odps驱动观测编译效果
		<br/>
    ```
    bin/build-driver.sh odps
    ```
  4. 整体编译即可
		<br/>
    ```
    bin/build.sh
    ```
