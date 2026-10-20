-- ════════════════════════════════════════════════════════════════
-- Photos : remplacement des visuels cassés ou incohérents
-- Sources : Wikimedia Commons (lieux emblématiques)
-- ════════════════════════════════════════════════════════════════

update destinations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Gambaku_Dome_of_Hiroshima.jpg' where slug = 'hiroshima';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Daibutsu-den_in_Todaiji_Nara01bs3200.jpg/1920px-Daibutsu-den_in_Todaiji_Nara01bs3200.jpg' where slug = 'nara';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg/1920px-200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg' where slug = 'nikko';
update destinations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Takayama_jinya.jpg' where slug = 'takayama';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Kenrokuen10-r.jpg/1920px-Kenrokuen10-r.jpg' where slug = 'kanazawa';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Itsukushima_Gate.jpg/1920px-Itsukushima_Gate.jpg' where slug = 'miyajima';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Magome_2009_5.JPG/1920px-Magome_2009_5.JPG' where slug = 'magome';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Ogimachi_Village-02.jpg/1920px-Ogimachi_Village-02.jpg' where slug = 'shirakawa';
update destinations set image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/LakeAshi_and_MtFuji_Hakone.JPG' where slug = 'hakone';
update destinations set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/230128_Kamakura_Daibutsu_Japan01s3.jpg/1920px-230128_Kamakura_Daibutsu_Japan01s3.jpg' where slug = 'kamakura';

update moodboard_images set url = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Gambaku_Dome_of_Hiroshima.jpg' where url = 'https://images.unsplash.com/photo-1599922407858-a3d0e1e6b7de?w=600&q=80';
update moodboard_images set url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Daibutsu-den_in_Todaiji_Nara01bs3200.jpg/1920px-Daibutsu-den_in_Todaiji_Nara01bs3200.jpg' where url = 'https://images.unsplash.com/photo-1624601573012-efb68f3f150d?w=600&q=80';
update moodboard_images set url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg/1920px-200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg' where url = 'https://images.unsplash.com/photo-1578469645742-46cae010e5d6?w=600&q=80';
update moodboard_images set url = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Takayama_jinya.jpg' where url = 'https://images.unsplash.com/photo-1580533089532-54e9b8f62997?w=600&q=80';
update moodboard_images set url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Kenrokuen10-r.jpg/1920px-Kenrokuen10-r.jpg' where url = 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&q=80';
update moodboard_images set url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Itsukushima_Gate.jpg/1920px-Itsukushima_Gate.jpg' where url = 'https://images.unsplash.com/photo-1505069446780-4ef442b5207f?w=600&q=80';
update moodboard_images set url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Magome_2009_5.JPG/1920px-Magome_2009_5.JPG' where url = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80';
update moodboard_images set url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Ogimachi_Village-02.jpg/1920px-Ogimachi_Village-02.jpg' where url = 'https://images.unsplash.com/photo-1611464908623-07f19927264e?w=600&q=80';
update moodboard_images set url = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/LakeAshi_and_MtFuji_Hakone.JPG' where url = 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&q=80';
