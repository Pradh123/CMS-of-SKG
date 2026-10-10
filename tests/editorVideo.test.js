import test from 'node:test'
import assert from 'node:assert/strict'
import {parseVideoUrl,videoMarkup} from '../src/utils/editorVideo.js'
test('normalizes supported video URLs and rejects unsafe URLs',()=>{
 assert.equal(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ').src,'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
 assert.equal(parseVideoUrl('https://vimeo.com/123456').src,'https://player.vimeo.com/video/123456')
 assert.equal(parseVideoUrl('https://example.com/video.mp4').kind,'video')
 for(const url of ['javascript:alert(1)','http://example.com/video.mp4','https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://youtube.com/watch?v=bad'])assert.throws(()=>parseVideoUrl(url))
 assert.ok(videoMarkup('https://youtu.be/dQw4w9WgXcQ','" title').includes('&quot; title'))
})
