import React, { useState, useEffect } from 'react';


const INITIAL_TOPICS = ['user.signup', 'order.checkout'];
const INITIAL_CONSUMERS = [
  { id: 'c-1', name: ' Welcome Email Worker', topic: 'user.signup', processed: 0, status: 'Active' },
  { id: 'c-2', name: ' Stripe Payment Router', topic: 'order.checkout', processed: 0, status: 'Active' },
  { id: 'c-3', name: ' Slack Analytics Webhook', topic: 'user.signup', processed: 0, status: 'Active' }
];

function App() {
  
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [consumers, setConsumers] = useState(INITIAL_CONSUMERS);
  const [messageQueue, setMessageQueue] = useState([]);
  
  
  const [inputTopicName, setInputTopicName] = useState('');
  const [inputConsumerName, setInputConsumerName] = useState('');
  const [targetConsumerTopic, setTargetConsumerTopic] = useState(INITIAL_TOPICS[0]);
  const [publishTopic, setPublishTopic] = useState(INITIAL_TOPICS[0]);
  const [publishPayload, setPublishPayload] = useState('{"id": 4096, "status": "PENDING"}');
  
  const [brokerLogs, setBrokerLogs] = useState([' Event Broker initialized. Topology management systems online...']);


  const handleAddTopic = (e) => {
    e.preventDefault();
    const cleanTopic = inputTopicName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanTopic || topics.includes(cleanTopic)) return;

    setTopics([...topics, cleanTopic]);
    setPublishTopic(cleanTopic);
    setTargetConsumerTopic(cleanTopic);
    setBrokerLogs(prev => [` TOPOLOGY MODIFIED: Channel channel topic node "${cleanTopic}" created.`, ...prev]);
    setInputTopicName('');
  };

 
  const handleAddConsumer = (e) => {
    e.preventDefault();
    if (!inputConsumerName.trim()) return;

    const freshConsumer = {
      id: `c-${Date.now().toString().slice(-4)}`,
      name: inputConsumerName.trim(),
      topic: targetConsumerTopic,
      processed: 0,
      status: 'Active'
    };

    setConsumers([...consumers, freshConsumer]);
    setBrokerLogs(prev => [` TOPOLOGY MODIFIED: Consumer "${freshConsumer.name}" subscribed to event stream [${targetConsumerTopic}].`, ...prev]);
    setInputConsumerName('');
  };


  const handlePublishMessage = (e) => {
    e.preventDefault();
    
    let verifiedPayload = {};
    try {
      verifiedPayload = JSON.parse(publishPayload);
    } catch (err) {
      setBrokerLogs(prev => [`❌ PACKET DROP: Syntactic JSON structure invalid. Publish blocked.`, ...prev]);
      return;
    }

    const messageId = `msg-${Date.now().toString().slice(-4)}`;
    const eventPacket = {
      id: messageId,
      topic: publishTopic,
      payload: verifiedPayload,
      timestamp: new Date().toLocaleTimeString()
    };

   
    setMessageQueue(prevQueue => [eventPacket, ...prevQueue.slice(0, 7)]);
    setBrokerLogs(prev => [` MESSAGE INGESTED: Event [${messageId}] published to channel [${publishTopic}].`, ...prev]);


    const activeSubscribers = consumers.filter(c => c.topic === publishTopic);
    
    if (activeSubscribers.length === 0) {
      setBrokerLogs(prev => [`⚠️ DEAD LETTER EXCEPTION: Event [${messageId}] message has zero active subscribers. Ignored.`, ...prev]);
      return;
    }

    setConsumers(prevConsumers => 
      prevConsumers.map(c => {
        if (c.topic === publishTopic) {
          setBrokerLogs(prev => [`⚡ DISPATCH SUCCESS: Worker node [${c.id}] processed message [${messageId}] successfully.`, ...prev]);
          return { ...c, processed: c.processed + 1 };
        }
        return c;
      })
    );
  };

  
  const aggregateProcessedCount = consumers.reduce((acc, curr) => acc + curr.processed, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', fontFamily: 'monospace', backgroundColor: '#070a13', color: '#f8fafc', minHeight: '90vh' }}>
      
      {/* */}
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '25px', marginBottom: '35px', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#ec4899', letterSpacing: '-0.5px' }}> DevBroker Concurrent Message Engine</h1>
          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '12px' }}>An interactive Pub/Sub message laboratory simulating asynchronous event distribution state arrays.</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '10px 20px', borderRadius: '10px', textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase' }}>Throughput Volumes</span>
            <h3 style={{ margin: '0', fontSize: '18px', color: '#ec4899' }}>{aggregateProcessedCount} Messages Dispatched</h3>
          </div>
        </div>
      </header>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '35px' }}>
        
       
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '14px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>1. Provision Topic Channels</h3>
          <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="e.g. cache.invalidate" value={inputTopicName} onChange={(e) => setInputTopicName(e.target.value)} style={{ flex: '1', padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
            <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Add ➕</button>
          </form>
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {topics.map(t => <span key={t} style={{ backgroundColor: '#070a13', border: '1px solid #ec4899', fontSize: '11px', color: '#ec4899', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>)}
          </div>
        </section>

        
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '14px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>2. Register Worker Consumers</h3>
          <form onSubmit={handleAddConsumer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="e.g. Email Processing Microservice" value={inputConsumerName} onChange={(e) => setInputConsumerName(e.target.value)} style={{ padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={targetConsumerTopic} onChange={(e) => setTargetConsumerTopic(e.target.value)} style={{ flex: '1', padding: '8px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#ec4899', color: '#070a13', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Deploy 🔌</button>
            </div>
          </form>
        </section>

        
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '14px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>3. Broadcast Packet Payload</h3>
          <form onSubmit={handlePublishMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={publishTopic} onChange={(e) => setPublishTopic(e.target.value)} style={{ flex: '1', padding: '8px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" disabled={topics.length === 0} style={{ padding: '8px 14px', backgroundColor: '#10b981', color: '#070a13', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Publish 📥</button>
            </div>
            <input type="text" value={publishPayload} onChange={(e) => setPublishPayload(e.target.value)} style={{ padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#a78bfa', fontSize: '12px', boxSizing: 'border-box' }} />
          </form>
        </section>

      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
       
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          
          <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Deployed Consumer Worker Topology</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <th style={{ padding: '6px', color: '#475569' }}>IDENTITY</th>
                    <th style={{ padding: '6px', color: '#475569' }}>LISTENER TOPIC</th>
                    <th style={{ padding: '6px', color: '#475569', textAlign: 'right' }}>PROCESSED</th>
                  </tr>
                </thead>
                <tbody>
                  {consumers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px dashed #1e293b' }}>
                      <td style={{ padding: '8px 6px', color: '#cbd5e1' }}>{c.name}</td>
                      <td style={{ padding: '8px 6px', color: '#38bdf8' }}>{c.topic}</td>
                      <td style={{ padding: '8px 6px', color: '#10b981', textAlign: 'right', fontWeight: 'bold' }}>{c.processed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          
          <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Ingested Event Message Cache (Last 7 events)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messageQueue.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '6px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#475569', marginRight: '8px' }}>[{msg.timestamp}]</span>
                    <span style={{ color: '#ec4899', fontWeight: 'bold', marginRight: '8px' }}>{msg.topic}</span>
                    <span style={{ color: '#cbd5e1' }}>{msg.id}</span>
                  </div>
                  <span style={{ color: '#a78bfa' }}>{JSON.stringify(msg.payload)}</span>
                </div>
              ))}
              {messageQueue.length === 0 && <div style={{ color: '#475569', fontSize: '11px', textAlign: 'center', padding: '10px 0' }}>No messages traversing message broker channels...</div>}
            </div>
          </section>

        </div>

        {/* RIGHT BOTTOM PANEL: DETAILED METRICS RUNTIME EMITTER TELEMETRY */}
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Broker Log Processor Telemetry</h3>
          <div style={{ flexGrow: '1', backgroundColor: '#070a13', borderRadius: '12px', padding: '20px', minHeight: '300px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {brokerLogs.map((log, index) => (
              <div key={index} style={{ 
                fontSize: '11px', lineHeight: '1.5',
                color: log.startsWith('❌') ? '#f43f5e' : log.startsWith('⚠️') ? '#fbbf24' : log.startsWith('⚡') ? '#10b981' : log.startsWith('📥') ? '#38bdf8' : '#475569'
              }}>
                {log}
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}

export default App;