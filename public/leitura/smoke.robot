*** Settings ***
Documentation    QA Atlas: regra pura local; não precisa de browser ou internet.

*** Test Cases ***
Soma De Centavos Preserva Total
    ${total}=    Evaluate    2000 + 4000 + 1500
    Should Be Equal As Integers    ${total}    7500
