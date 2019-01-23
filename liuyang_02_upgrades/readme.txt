1. 由于目前复发融合进nbi，所以独立起了一个工程： hbfec_upgrades, 与genieacs同层级
   无法融合原因：怀疑是formidable与nbi中的一些代码（处理request的部分）有冲突。
   现象：提交上传请求后，post请求一直出于pending状态。
   相关测试代码参见文件夹：“backup_20180716_废弃的上传代码”
