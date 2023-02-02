<!--
title: "title_metadata"
description: "description_metadata"
...
-->



import { OneLineInstallWget, OneLineInstallCurl } from '@site/src/components/OneLineInstall/'
import { Install, InstallBox } from '@site/src/components/Install/'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Text regarding the document

(we will use the below notes instead of github admonitions. To use the emojis, type a : and then start typing the emoji name. The ones we are going to use are: info -> "bookmark_tabs", tip -> "lightbulb", note -> "pencil2", warning -> "warning", caution -> "fire" )

> 📑 Info
>
> This is an info block.

> 💡 Tip
> 
> This is a tip block.

> ✏️ Note
> 
> This is a note block.

> ⚠️ Warning
> 
> This is a warning block.

> 🔥 Caution
> 
> This is a caution block.


## Header_Text

Description of the header

(when we use docusaurus tabs, we should have also the tab's name as a sentence in a heading below, as such:)

<Tabs>
<TabItem value="tab1" label="tab1">
  
<h3> Header for tab1 </h3>
  
text for tab1, both visible in GitHub and Docusaurus
    
    
</TabItem>
<TabItem value="tab2" label="tab2">
    
<h3> Header for tab2 </h3>
    
text for tab2, both visible in GitHub and Docusaurus

</TabItem>
</Tabs>

(due to the nature of the way github reads HTML elements, we can't use the HTML codeblock element for tab labels, we will only use text, and it will be hidden from the preview)

## Sample_Heading

The text continues below...
