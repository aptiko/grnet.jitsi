==============================
grnet.jitsi Ansible collection
==============================

Installation
============

::

  ansible-galaxy collection install \
      git+https://github.com/grnet/grnet.jitsi.git

Inventory
=========

Here is an example inventory for installing both roles on the same
server::

    [jitsi_meet]
    my-jitsi-meet-server

    [jitsi_videobridge]
    my-jitsi-meet-server

The ``jitsi_meet`` group must contain only one server. That server must
also be listed in the ``jitsi_videobridge`` group ; that is, the Jitsi
Meet server must also be a videobridge (this is a limitation of the
Jitsi Debian packages, where ``jitsi-videobridge`` is a dependency of
``jitsi-meet``). Additional videobridges can be added if desired.  The
playbook (see below) will assign the ``jitsi_meet`` role to the server
in the ``jitsi_meet`` group and the ``jitsi_videobridge`` role to the
servers in the ``jitsi_videobridge`` group.

Although in principle nginx, jitsi-meet, prosody and jicofo could reside
in different machines, the role ``jitsi_meet`` puts them all in a single
server.

Variables
=========

You need to make certain that some variables are available to the
roles, e.g. by putting them in ``group_vars/all``. Obviously it's a good
idea to vault the passwords/secrets. Here is an example::

    jicofo_password: topsecret1
    jicofo_secret: topsecret2
    videobridge_user: myvideobridgeuser
    videobridge_password: topsecret3
    videobridge_muc_nickname: myvideobridge_muc_nick

Playbook
========

Use a playbook similar to this::

    ---
    - name: Jitsi server
    hosts: jitsi_meet
    roles:
        - grnet.jitsi.jitsi_meet

    - name: Jitsi videobridge
    hosts: jitsi_videobridge
    roles:
        - grnet.jitsi.jitsi_videobridge

Jitsi architecture
==================

The **Jitsi videobridge**, also known as **jvb**, is the component that
does the most essential work: it hosts conferences. All users connect to
the videobridge; they send their video and audio stream to it, and
receive the video and audio streams of the other users from it. Clients
talk WebRTC to the videobridge on UDP port 10000 (this does not appear
to be configurable).

The videobridge also listens on a TCP port, typically 9090, that speaks
"Colibri", a protocol on top of HTTP/WebSocket. Clients receive extra
information from that connection, such as which users connected or
disconnected from the conference. This port is actually proxied through
nginx, so clients actually connect to nginx at 443, and URL
``/colibri-ws/[videobridge-id]/`` is proxied to the videobridge.

Although the most common case is for a Jitsi installation to use a
single videobridge, you can have many videobridges for better
performance if you have many conferences, and each videobridge can host
one or more conferences. (A given conference always uses a single
videobridge.)

**Jicofo**, misleadingly meaning "Jitsi conference focus", is the
component that orchestrates conferences. Users connect to jicofo and ask
to create or join a conference. Jicofo creates the conference on the
less loaded videobridge and directs users to it. All communication
between Jicofo and other components goes through prosody (more on that
below). Jicofo also listens on TCP port 8888, but this is only an API
for diagnostic information or so.

**Jitsi-meet** is the JavaScript client the user runs on the browser. It
is loaded through nginx when the user visits the jitsi web site.

**Prosody** is a XMPP signaling server that in this case works as a
publish/subscribe queue. Videobridges publish information about
themselves on prosody, and jicofo subscribes to prosody and gets that
information from there. In addition, jitsi meet connects to prosody (via
nginx) and communicates with jicofo through it. Prosody listens on TCP
ports 5222 (XMPP client), 5269 (XMPP server), and 5280 (XMPP BOSH). Most
components, such as Jicofo and videobridges, connect to 5222. Nginx
also proxies ``/http-bind`` and ``/xmpp-websocket`` to prosody's 5280.

For additional information on Jitsi, see:

- the `Architecture section in the Jitsi documentation`_.
- a video on `how to load balance jitsi meet`_, which is useful
  even if you don't intend to load-balance.
- `a related discussion`_ in the forum, notably the `RENATER
  document`_ and the `flow chart`_.
- `another related discussion`_ in the forum.

.. _architecture section in the Jitsi documentation: https://jitsi.github.io/handbook/docs/architecture/
.. _how to load balance jitsi meet: https://www.youtube.com/watch?v=LyGV4uW8km8
.. _a related discussion: https://community.jitsi.org/t/architecture-design-of-jicofo/14906/2
.. _renater document: https://conf-ng.jres.org/2015/document_revision_1830.html?download
.. _flow chart: https://go.gliffy.com/go/publish/image/7649541/L.png
.. _another related discussion: https://community.jitsi.org/t/jicofo-and-prosody-ports/119669/1

Variables and options
=====================

- ``jicofo_password``, ``jicofo_secret``: The Jicofo username is set as
  "focus", and the password is set to the value of ``jicofo_password``.
  It's not actually used anywhere (but has to be set). Likewise with the
  ``jicofo_secret``.
- ``videobridge_user``, ``videobridge_password``: Username and password for
  the videobridge. The user is registered in prosody, and subsequently
  the videobridges connect to prosody as this user. The user is also
  apparently used for SIP, but this is currently not supported by this
  role.
- ``videobridge_muc_nickname``: (Used only by the ``jitsi-videobridge``
  role.) Any unique string that is the same for all videobridges will
  work here. Other than that, we don't know exactly what it is for. See
  the `Jitsi multi-user chat documentation`_ for more information.

.. _jitsi multi-user chat documentation: https://github.com/jitsi/jitsi-videobridge/blob/master/doc/muc.md

Copyright and license
=====================

Written by Antonis Christofides. The ``jitsi_meet`` and
``jitsi-videobridge`` roles were originally based on the
``ansible-jitsi-meet`` role from
https://github.com/udima-university/ansible-jitsi-meet (though they now
contain very little from there).

| © 2020-2022 The copyright holders of ansible-jitsi-meet
| © 2022-2023 GRNET

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
