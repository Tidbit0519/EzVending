--------------------------------------------------------
--  File created - Tuesday-August-30-2022   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Table FAVORITE_SNACKS
--------------------------------------------------------

/* SQL statement that creates the table for the program */
  CREATE TABLE "OIT#JTBT2"."FAVORITE_SNACKS" 
   (	"BYU_ID" VARCHAR2(9 BYTE), 
	"FULL_NAME" VARCHAR2(30 BYTE), 
	"SNACKS" VARCHAR2(30 BYTE), 
	"PRICE" VARCHAR2(5 BYTE), 
	"PURCHASE_DATE" VARCHAR2(10 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
REM INSERTING into OIT#JTBT2.FAVORITE_SNACKS
SET DEFINE OFF;
